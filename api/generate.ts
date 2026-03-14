import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Modality } from '@google/genai';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { checkAuth } from '../server/lib/checkAuth.js';
import { consumeCredit, refundCredit, getUser, getEffectiveCredits, isUnlimitedCreditsEmail, type UserRecord } from '../server/lib/store.js';
import { addActivity } from '../server/lib/activity.js';
import { addDebugLog } from '../server/lib/debugLog.js';
import { bucket } from '../server/lib/firebaseAdmin.js';
import sharp from 'sharp';

const parseBody = async (req: VercelRequest) => {
  if (req.body && typeof req.body === 'object') return req.body;
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
  }
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const normalizePlan = (plan?: string | null): string => {
  const raw = String(plan ?? '').trim().toLowerCase();
  return raw || 'free';
};

const hasKV =
  !!process.env.KV_REST_API_URL &&
  !!(process.env.KV_REST_API_TOKEN || process.env.KV_REST_API_READ_ONLY_TOKEN);
const GUEST_TRIAL_COOKIE = 'pm_guest_trial';
const GUEST_TRIAL_TTL_SECONDS = 60 * 60 * 24;
const GUEST_DAILY_WINDOW_SECONDS = 60 * 60 * 24 * 2;
const GUEST_TRIAL_CAP = (() => {
  const parsed = Number(process.env.ANON_FREE_GENERATION_CAP || 3);
  if (!Number.isFinite(parsed)) return 3;
  return Math.max(1, Math.min(3, Math.floor(parsed)));
})();
const GUEST_TRIAL_IP_DAILY_CAP = (() => {
  const parsed = Number(process.env.ANON_FREE_IP_DAILY_CAP || 4);
  if (!Number.isFinite(parsed)) return 4;
  return Math.max(1, Math.min(20, Math.floor(parsed)));
})();
const GUEST_TRIAL_FINGERPRINT_DAILY_CAP = (() => {
  const parsed = Number(process.env.ANON_FREE_DEVICE_DAILY_CAP || 3);
  if (!Number.isFinite(parsed)) return 3;
  return Math.max(1, Math.min(20, Math.floor(parsed)));
})();
const guestMemoryUsage = new Map<string, number>();
let logoSvgCache: string | null = null;

const getKv = async () => {
  const mod = await import('@vercel/kv');
  return mod.kv;
};

const parseCookies = (req: VercelRequest) => {
  const cookieHeader = String(req.headers.cookie || '');
  return cookieHeader
    .split(';')
    .map(part => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, item) => {
      const idx = item.indexOf('=');
      if (idx === -1) return acc;
      const key = item.slice(0, idx).trim();
      const value = item.slice(idx + 1).trim();
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
};

const getGuestSecret = () => process.env.SESSION_SECRET || process.env.MAGIC_TOKEN_SECRET || 'guest-fallback-secret';
const getHeaderString = (value: string | string[] | undefined) => (Array.isArray(value) ? String(value[0] || '') : String(value || ''));

const getUtcDayBucket = () => {
  const iso = new Date().toISOString();
  return iso.slice(0, 10);
};

const hashGuestKeyPart = (value: string): string =>
  crypto.createHmac('sha256', getGuestSecret()).update(value).digest('hex').slice(0, 24);

const getCoarseIp = (ip: string): string => {
  const raw = String(ip || '').trim();
  if (!raw) return 'unknown';
  if (raw.includes('.')) {
    const parts = raw.split('.');
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
  }
  if (raw.includes(':')) {
    const parts = raw.split(':').filter(Boolean);
    return `${parts.slice(0, 4).join(':')}::/64`;
  }
  return raw;
};

const getClientIp = (req: VercelRequest): string => {
  const forwardedFor = getHeaderString(req.headers['x-forwarded-for']);
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = getHeaderString(req.headers['x-real-ip']);
  if (realIp) return realIp.trim();
  const vercelIp = getHeaderString(req.headers['x-vercel-forwarded-for']);
  if (vercelIp) return vercelIp.trim();
  return 'unknown';
};

const getDeviceFingerprint = (req: VercelRequest, ip: string): string => {
  const userAgent = getHeaderString(req.headers['user-agent']).slice(0, 180);
  const acceptLanguage = getHeaderString(req.headers['accept-language']).slice(0, 120);
  const secChUa = getHeaderString(req.headers['sec-ch-ua']).slice(0, 120);
  const secPlatform = getHeaderString(req.headers['sec-ch-ua-platform']).slice(0, 80);
  const coarseIp = getCoarseIp(ip);
  return [userAgent, acceptLanguage, secChUa, secPlatform, coarseIp].join('|');
};

const getGuestCounterUsage = async (key: string): Promise<number> => {
  if (hasKV) {
    try {
      const kv = await getKv();
      const value = await kv.get<number>(key);
      return Math.max(0, Number(value || 0));
    } catch {
      return Math.max(0, Number(guestMemoryUsage.get(key) || 0));
    }
  }
  return Math.max(0, Number(guestMemoryUsage.get(key) || 0));
};

const incrementGuestCounterUsage = async (key: string, ttlSeconds: number): Promise<number> => {
  if (hasKV) {
    try {
      const kv = await getKv();
      const next = await kv.incr(key);
      await kv.expire(key, ttlSeconds);
      return Math.max(0, Number(next || 0));
    } catch {
      const fallback = Math.max(0, Number(guestMemoryUsage.get(key) || 0)) + 1;
      guestMemoryUsage.set(key, fallback);
      return fallback;
    }
  }
  const next = Math.max(0, Number(guestMemoryUsage.get(key) || 0)) + 1;
  guestMemoryUsage.set(key, next);
  return next;
};

const createGuestTrialToken = (guestId: string): string => {
  const payload = Buffer.from(JSON.stringify({
    guestId,
    exp: Date.now() + GUEST_TRIAL_TTL_SECONDS * 1000,
  })).toString('base64url');
  const sig = crypto.createHmac('sha256', getGuestSecret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
};

const verifyGuestTrialToken = (token: string | null): string | null => {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = crypto.createHmac('sha256', getGuestSecret()).update(payload).digest('base64url');
  const expectedBuf = Buffer.from(expected);
  const sigBuf = Buffer.from(sig);
  if (expectedBuf.length !== sigBuf.length) return null;
  if (!crypto.timingSafeEqual(expectedBuf, sigBuf)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { guestId?: string; exp?: number };
    const guestId = String(parsed.guestId || '').trim();
    const exp = Number(parsed.exp || 0);
    if (!guestId || !exp || Date.now() > exp) return null;
    return guestId;
  } catch {
    return null;
  }
};

const buildGuestTrialCookie = (req: VercelRequest, guestId: string) => {
  const proto = String(req.headers['x-forwarded-proto'] || (String(req.headers.host || '').includes('localhost') ? 'http' : 'https'));
  const secureFlag = proto === 'https' ? '; Secure' : '';
  const token = createGuestTrialToken(guestId);
  return `${GUEST_TRIAL_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly${secureFlag}; SameSite=Lax; Max-Age=${GUEST_TRIAL_TTL_SECONDS}`;
};

const getGuestTrialUsage = async (guestId: string): Promise<number> => {
  const key = `guest_trial_usage:${guestId}`;
  if (hasKV) {
    try {
      const kv = await getKv();
      const value = await kv.get<number>(key);
      return Math.max(0, Number(value || 0));
    } catch {
      return Math.max(0, Number(guestMemoryUsage.get(guestId) || 0));
    }
  }
  return Math.max(0, Number(guestMemoryUsage.get(guestId) || 0));
};

const incrementGuestTrialUsage = async (guestId: string): Promise<number> => {
  const key = `guest_trial_usage:${guestId}`;
  if (hasKV) {
    try {
      const kv = await getKv();
      const next = await kv.incr(key);
      await kv.expire(key, GUEST_TRIAL_TTL_SECONDS);
      return Math.max(0, Number(next || 0));
    } catch {
      const fallback = Math.max(0, Number(guestMemoryUsage.get(guestId) || 0)) + 1;
      guestMemoryUsage.set(guestId, fallback);
      return fallback;
    }
  }
  const next = Math.max(0, Number(guestMemoryUsage.get(guestId) || 0)) + 1;
  guestMemoryUsage.set(guestId, next);
  return next;
};

const getLogoSvg = async (): Promise<string> => {
  if (logoSvgCache) return logoSvgCache;
  const logoPath = path.join(process.cwd(), 'public', 'img', 'logos', 'colorlogo.svg');
  logoSvgCache = await fs.readFile(logoPath, 'utf8');
  return logoSvgCache;
};

const applyLogoWatermarkToPngBase64 = async (imageBase64: string): Promise<string> => {
  const sourceBuffer = Buffer.from(imageBase64, 'base64');
  const image = sharp(sourceBuffer, { failOn: 'none' });
  const metadata = await image.metadata();
  const width = Math.max(1, Number(metadata.width || 0));
  const height = Math.max(1, Number(metadata.height || 0));
  if (!width || !height) return imageBase64;

  const logoSvg = await getLogoSvg();
  const targetLogoWidth = Math.max(140, Math.round(width * 0.17));
  const logoHeight = Math.max(48, Math.round(targetLogoWidth * 0.28));
  const margin = Math.max(18, Math.round(Math.min(width, height) * 0.02));
  const encodedLogo = Buffer.from(logoSvg).toString('base64');
  const overlaySvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${targetLogoWidth}" height="${logoHeight}" viewBox="0 0 ${targetLogoWidth} ${logoHeight}">
      <image href="data:image/svg+xml;base64,${encodedLogo}" width="${targetLogoWidth}" height="${logoHeight}" opacity="0.42" preserveAspectRatio="xMidYMid meet" />
    </svg>
  `;
  const output = await image
    .composite([{
      input: Buffer.from(overlaySvg),
      left: Math.max(0, width - targetLogoWidth - margin),
      top: Math.max(0, height - logoHeight - margin),
      blend: 'over',
    }])
    .png()
    .toBuffer();
  return output.toString('base64');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const authenticatedEmail = checkAuth(req);
  const ADMIN_EMAILS = ['juanamisano@gmail.com', 'boostugc@gmail.com'];
  const isAdminUser = authenticatedEmail ? ADMIN_EMAILS.includes(authenticatedEmail.toLowerCase().trim()) : false;
  const isAnonymousTrial = !authenticatedEmail;
  const body = await parseBody(req);
  const vercelEnv = String(process.env.VERCEL_ENV || '').trim().toLowerCase();
  const requestHost = getHeaderString(req.headers.host).trim().toLowerCase();
  const isProjectsPreviewHost =
    requestHost === 'projects.vercel.app' || requestHost.endsWith('.projects.vercel.app');
  const isPreview = vercelEnv === 'preview' || isProjectsPreviewHost;
  const unlimitedEnv = process.env.UNLIMITED_CREDITS === 'true';
  const headerBypassRaw = Array.isArray(req.headers['x-trial-bypass-code'])
    ? req.headers['x-trial-bypass-code'][0]
    : req.headers['x-trial-bypass-code'];
  const headerBypassCode = String(headerBypassRaw || '').trim().toUpperCase();
  const bodyBypassCode = typeof body.trialBypassCode === 'string' ? body.trialBypassCode.trim().toUpperCase() : '';
  const testerBypassCode = String(process.env.TESTER_UPGRADE_CODE || '8714').trim();
  const bypassCodes = new Set([
    '2999',
    '8714',
    testerBypassCode.toUpperCase(),
  ]);
  const bypassByCode = Boolean(
    (headerBypassCode && bypassCodes.has(headerBypassCode)) ||
    (bodyBypassCode && bypassCodes.has(bodyBypassCode))
  );
  const bypassCreditLimits = isPreview || unlimitedEnv || bypassByCode;
  let guestId: string | null = null;
  let shouldSetGuestCookie = false;
  let guestIpUsageKey: string | null = null;
  let guestFingerprintUsageKey: string | null = null;
  let anonymousRemaining = 0;
  if (isAnonymousTrial) {
    const cookies = parseCookies(req);
    const existingGuestId = verifyGuestTrialToken(cookies[GUEST_TRIAL_COOKIE] || null);
    guestId = existingGuestId || `guest_${crypto.randomUUID()}`;
    shouldSetGuestCookie = !existingGuestId;
    if (!bypassCreditLimits) {
      const dayBucket = getUtcDayBucket();
      const clientIp = getClientIp(req);
      const ipHash = hashGuestKeyPart(getCoarseIp(clientIp));
      const fpHash = hashGuestKeyPart(getDeviceFingerprint(req, clientIp));
      guestIpUsageKey = `guest_trial_ip_usage:${dayBucket}:${ipHash}`;
      guestFingerprintUsageKey = `guest_trial_fp_usage:${dayBucket}:${fpHash}`;

      const [usageByToken, usageByIp, usageByFingerprint] = await Promise.all([
        getGuestTrialUsage(guestId),
        getGuestCounterUsage(guestIpUsageKey),
        getGuestCounterUsage(guestFingerprintUsageKey),
      ]);
      const tokenRemaining = Math.max(GUEST_TRIAL_CAP - usageByToken, 0);
      const ipRemaining = Math.max(GUEST_TRIAL_IP_DAILY_CAP - usageByIp, 0);
      const fingerprintRemaining = Math.max(GUEST_TRIAL_FINGERPRINT_DAILY_CAP - usageByFingerprint, 0);
      anonymousRemaining = Math.min(tokenRemaining, ipRemaining, fingerprintRemaining);

      if (anonymousRemaining <= 0) {
        if (shouldSetGuestCookie && guestId) {
          res.setHeader('Set-Cookie', buildGuestTrialCookie(req, guestId));
        }
        res.status(402).json({
          error: 'Free trial limit reached. Sign in to keep generating and remove watermark.',
          upgrade_required: true,
          reason: 'trial_limit',
          trial_remaining: 0,
          trial_cap: GUEST_TRIAL_CAP,
        });
        return;
      }
    } else {
      console.log('[CREDITS] Anonymous trial limit bypass active (preview/unlimited mode)', {
        vercelEnv,
        requestHost,
        isProjectsPreviewHost,
      });
    }
  }
  const email = authenticatedEmail || guestId || undefined;
  const isUnlimited = authenticatedEmail ? isUnlimitedCreditsEmail(authenticatedEmail) : false;

  // Defensive validation: payload size
  const MAX_BODY_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_INLINE_IMAGES = 6; // 1 human reference + up to 5 product images
  const MAX_INLINE_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB per image
  const rawBodyString = JSON.stringify(body);
  if (Buffer.byteLength(rawBodyString, 'utf8') > MAX_BODY_SIZE) {
    res.status(413).json({ error: 'Payload too large (max 5MB)' });
    return;
  }
  const parts = Array.isArray(body.parts) ? body.parts : null;
  const model = typeof body.model === 'string' && body.model.trim() ? body.model.trim() : 'gemini-2.0-flash-preview-image-generation';
  console.log('MODEL RECEIVED:', model);
  const aspectRatio = typeof body.aspectRatio === 'string' ? body.aspectRatio : '1:1';
  const preserveReferenceImage = Boolean(body.preserveReferenceImage);
  const imageStrength = typeof body.imageStrength === 'number' ? body.imageStrength : undefined;
  const guidanceScale = typeof body.guidanceScale === 'number' ? body.guidanceScale : undefined;
  const negativePrompt = typeof body.negativePrompt === 'string' ? body.negativePrompt : undefined;
  console.log('[IMAGE STRENGTH RECEIVED]', imageStrength);
  console.log('[GUIDANCE SCALE RECEIVED]', guidanceScale);
  console.log('[NEGATIVE PROMPT RECEIVED]', negativePrompt);
  const envApiKey = String(process.env.GOOGLE_API_KEY || '').trim();
  const bodyApiKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : '';
  const apiKey = bodyApiKey || envApiKey;
  console.log('[GENAI] GOOGLE_API_KEY length:', envApiKey.length);
  console.log('[GENAI] body.apiKey length:', bodyApiKey.length);
  console.log('[GENAI] resolved api key source:', bodyApiKey ? 'body' : 'env');
  const rawDebugMeta = body?.debugMeta && typeof body.debugMeta === 'object' ? body.debugMeta : null;
  const debugMeta = rawDebugMeta
    ? {
        promptHash: typeof rawDebugMeta.promptHash === 'string' ? rawDebugMeta.promptHash.slice(0, 128) : undefined,
        sceneType: typeof rawDebugMeta.sceneType === 'string' ? rawDebugMeta.sceneType.slice(0, 64) : undefined,
        mode: typeof rawDebugMeta.mode === 'string' ? rawDebugMeta.mode.slice(0, 64) : undefined,
        aspectRatio: typeof rawDebugMeta.aspectRatio === 'string' ? rawDebugMeta.aspectRatio.slice(0, 16) : undefined,
      }
    : null;

  // Model config (restored from 7695e35)
  // No whitelist/fallback logic
  const MODEL_WHITELIST = undefined; // Not used in this version
  const DEFAULT_MODEL = 'gemini-2.0-flash-preview-image-generation';

  // Validate parts structure
  if (!Array.isArray(parts) || parts.length === 0) {
    await addDebugLog('generate.reject.missing_parts', {
      aspectRatio,
  model,
      promptHash: debugMeta?.promptHash,
    }, email);
    res.status(400).json({ error: 'Missing prompt parts' });
    return;
  }
  let inlineImageCount = 0;
  for (const part of parts) {
    if (typeof part !== 'object' || (!('text' in part) && !('inlineData' in part))) {
      res.status(400).json({ error: 'Invalid part structure' });
      return;
    }
    if ('inlineData' in part) {
      inlineImageCount++;
      const data = part.inlineData?.data;
      if (typeof data === 'string' && Buffer.byteLength(data, 'base64') > MAX_INLINE_IMAGE_SIZE) {
        res.status(413).json({ error: 'Inline image too large (max 4MB)' });
        return;
      }
    }
  }
  if (inlineImageCount > MAX_INLINE_IMAGES) {
    res.status(413).json({ error: 'Too many inline images (max 1)' });
    return;
  }

  // InlineData: always enable preserveReferenceImage when a product reference is present.
  // Wine served mode no longer modifies the bottle — the reference image must always be preserved.
  const hasInlineData = parts.some(part => 'inlineData' in part);
  let effectivePreserveReferenceImage = preserveReferenceImage;
  if (hasInlineData && !preserveReferenceImage) {
    console.warn('[INLINE_DATA] inlineData detected → auto-enabling preserveReferenceImage');
    effectivePreserveReferenceImage = true;
  }

  if (!apiKey) {
    await addDebugLog('generate.reject.missing_api_key', {
      aspectRatio,
  model,
      promptHash: debugMeta?.promptHash,
    }, email);
    res.status(500).json({ error: 'No Google API key available (body or env)' });
    return;
  }
  if (!apiKey.startsWith('AIza')) {
    res.status(500).json({ error: 'Resolved Google API key has invalid format (expected API key)' });
    return;
  }
  if (!parts || parts.length === 0) {
    await addDebugLog('generate.reject.missing_parts', {
      aspectRatio,
  model,
      promptHash: debugMeta?.promptHash,
    }, email);
    res.status(400).json({ error: 'Missing prompt parts' });
    return;
  }

  let creditResult: Awaited<ReturnType<typeof consumeCredit>> | null = null;
  if (!isAnonymousTrial) {
    const creditMode = isProjectsPreviewHost
      ? 'projects-preview-host'
      : isPreview
      ? 'preview'
      : (unlimitedEnv ? 'unlimited-env' : (bypassByCode ? 'tester-code' : (vercelEnv || 'standard')));
    console.log(`[CREDITS] Mode=${creditMode} (VERCEL_ENV=${vercelEnv || 'undefined'}, host=${requestHost || 'unknown'}, UNLIMITED_CREDITS=${unlimitedEnv})`);
    if (bypassCreditLimits) {
      console.log('[CREDITS] Skipped decrement in preview/unlimited mode');
    } else {
      creditResult = await consumeCredit(authenticatedEmail!);
      if (!creditResult.ok || !creditResult.bucket) {
        await addDebugLog('generate.reject.no_credits', {
          aspectRatio,
          model,
          promptHash: debugMeta?.promptHash,
        }, authenticatedEmail);
        res.status(402).json({ error: 'No credits remaining' });
        return;
      }
      if (creditResult.bucket !== 'admin') {
        await addActivity(authenticatedEmail!, 'image', { delta: -1, bucket: creditResult.bucket });
      }
    }
  }

  // Restore GoogleGenAI initialization from 7695e35
  const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });
  // Authenticated users (any plan): try 4K → 2K → 1K for max quality.
  // Anonymous trial users: try 2K → 1K to limit costs.
  // Quality downgrade for free plan is applied after generation (JPEG compression).
  const requestedImageSizes = (isPreview || authenticatedEmail) ? ['4K', '2K', '1K'] : ['2K', '1K'];

  // ─────────────────────────────────────────────────────────────────────────

  try {
    const supportsFallbackImageSize = (message: string) => {
      const normalized = message.toLowerCase();
      return (
        normalized.includes('imagesize') ||
        normalized.includes('image size') ||
        normalized.includes('invalid enum') ||
        normalized.includes('unsupported') ||
        normalized.includes('bad request') ||
        normalized.includes('400')
      );
    };

    const generateWithRetry = async () => {
      const maxAttempts = 4;
      let lastError: unknown = null;

      for (const requestedImageSize of requestedImageSizes) {
        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
          try {
            const response = await ai.models.generateContent({
              model,
              contents: { parts },
              config: {
                responseModalities: [Modality.IMAGE],
                safetySettings: [],
                imageConfig: {
                  aspectRatio,
                },
                generationConfig: {
                  responseMimeType: 'image/png',
                  aspectRatio,
                  preserveReferenceImage: effectivePreserveReferenceImage,
                  ...(imageStrength !== undefined ? { imageStrength } : {}),
                  ...(guidanceScale !== undefined ? { guidanceScale } : {}),
                  ...(negativePrompt !== undefined ? { negativePrompt } : {}),
                  temperature: 0.25,
                  topP: 0.9,
                  seed: crypto.randomUUID(),
                },
              } as any,
            });
            return { response, requestedImageSize };
          } catch (error) {
            lastError = error;
            const message = String((error as any)?.message ?? error);
            const normalized = message.toLowerCase();
            const statusCode = Number((error as any)?.status || (error as any)?.code || 0);
            const shouldRetry =
              attempt < maxAttempts &&
              (message.includes('Failed to fetch') ||
                message.includes('ERR_CONNECTION_CLOSED') ||
                message.includes('NetworkError') ||
                normalized.includes('internal error encountered') ||
                normalized.includes('"status":"internal"') ||
                normalized.includes('"code":500') ||
                normalized.includes('service unavailable') ||
                normalized.includes('deadline exceeded') ||
                statusCode === 500 ||
                statusCode === 503 ||
                statusCode === 504);
            if (shouldRetry) {
              await new Promise(resolve => setTimeout(resolve, 600 * attempt * attempt));
              continue;
            }
            if (supportsFallbackImageSize(message) && requestedImageSize !== requestedImageSizes[requestedImageSizes.length - 1]) {
              console.warn('[IMAGE_SIZE_FALLBACK]', { requestedImageSize, reason: message });
              break;
            }
            throw error;
          }
        }
      }
      throw lastError ?? new Error('Image generation failed after retries.');
    };

    const { response, requestedImageSize } = await generateWithRetry();
    const responseParts = response?.candidates?.[0]?.content?.parts ?? [];
    const inlineImage = responseParts.find((part: any) => part?.inlineData?.data) as { inlineData?: { data?: string } } | undefined;
    const encodedImage = inlineImage?.inlineData?.data;
    if (!encodedImage) {
      throw new Error('Image generation failed.');
    }
    
    // Determine user's plan for quality/watermark decisions
    const userRecord = authenticatedEmail ? await getUser(authenticatedEmail) : null;
    const userPlan = userRecord ? normalizePlan(userRecord.plan) : 'anonymous';
    const isFreePlan = userPlan === 'free' && !isUnlimited && !isAdminUser;
    
    // Apply watermark for anonymous trial users AND free plan users
    const shouldApplyWatermark = (isAnonymousTrial || isFreePlan) && !isAdminUser && !isPreview;
    const maybeWatermarkedImage = shouldApplyWatermark
      ? await applyLogoWatermarkToPngBase64(encodedImage)
      : encodedImage;

    // 🔥 Reduce quality for free plan users (not paying subscribers)
    // Free plan: reduced resolution + JPEG compression for lower storage costs
    // Paid plans: full PNG quality
    let buffer: Buffer;
    let contentType = 'image/png';
    if (isFreePlan && !isPreview) {
      console.log('[QUALITY] Applying reduced quality for free plan user');
      buffer = await sharp(Buffer.from(maybeWatermarkedImage, 'base64'))
        .resize(1536, 1536, { fit: 'inside', withoutEnlargement: true }) // Max 1536px
        .jpeg({ quality: 65, mozjpeg: true }) // JPEG with 65% quality
        .toBuffer();
      contentType = 'image/jpeg';
    } else {
      buffer = Buffer.from(maybeWatermarkedImage, 'base64');
    }
    const outputMetadata = await sharp(buffer, { failOn: 'none' }).metadata();
    const imageMeta = {
      requestedImageSize,
      width: Number(outputMetadata.width || 0),
      height: Number(outputMetadata.height || 0),
      bytes: buffer.length,
      contentType,
      isPreview,
      isFreePlan,
      model,
    };
    console.log('[GENERATE_IMAGE_META]', imageMeta);
    const fileExtension = contentType === 'image/jpeg' ? 'jpg' : 'png';
    const fileName = `generations/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const file = bucket.file(fileName);

    await file.save(buffer, {
      metadata: {
        contentType,
        cacheControl: 'public, max-age=31536000, immutable',
      },
    });

    // Make file publicly accessible (fixes CORS)
    await file.makePublic();
    
    // Use public URL instead of signed URL
    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    await addDebugLog('generate.success', {
      aspectRatio,
  model,
      promptHash: debugMeta?.promptHash,
      mode: debugMeta?.mode,
      sceneType: debugMeta?.sceneType,
      imageUrl,
      imageMeta,
    }, email);

    // imageBase64 is included in the response so the browser can render the image
    // directly without a cross-origin fetch to Firebase Storage.
    // The imageUrl is still returned for gallery/persistence use.
    const responseImageBase64 = maybeWatermarkedImage;

    if (isAnonymousTrial) {
      let remaining = Math.max(anonymousRemaining - 1, 0);
      if (!bypassCreditLimits) {
        const usageTasks: Array<Promise<number>> = [incrementGuestTrialUsage(guestId!)];
        if (guestIpUsageKey) {
          usageTasks.push(incrementGuestCounterUsage(guestIpUsageKey, GUEST_DAILY_WINDOW_SECONDS));
        }
        if (guestFingerprintUsageKey) {
          usageTasks.push(incrementGuestCounterUsage(guestFingerprintUsageKey, GUEST_DAILY_WINDOW_SECONDS));
        }
        const [usageAfterToken, usageAfterIp = 0, usageAfterFingerprint = 0] = await Promise.all(usageTasks);
        const remainingByToken = Math.max(GUEST_TRIAL_CAP - usageAfterToken, 0);
        const remainingByIp = guestIpUsageKey ? Math.max(GUEST_TRIAL_IP_DAILY_CAP - usageAfterIp, 0) : remainingByToken;
        const remainingByFingerprint = guestFingerprintUsageKey
          ? Math.max(GUEST_TRIAL_FINGERPRINT_DAILY_CAP - usageAfterFingerprint, 0)
          : remainingByToken;
        remaining = Math.min(remainingByToken, remainingByIp, remainingByFingerprint, Math.max(anonymousRemaining - 1, 0));
      } else {
        remaining = 999_999;
      }
      if (shouldSetGuestCookie && guestId) {
        res.setHeader('Set-Cookie', buildGuestTrialCookie(req, guestId));
      }
      res.status(200).json({
        ok: true,
        imageUrl,
        imageBase64: responseImageBase64,
        imageMeta,
        anonymous_trial: true,
        trial_remaining: remaining,
        trial_cap: GUEST_TRIAL_CAP,
      });
      return;
    }

    // Use userRecord fetched earlier (no need to call getUser again)
    const user = userRecord!;
    if (creditResult?.bucket !== 'admin') {
      await addActivity(authenticatedEmail!, 'image', {
        kind: 'generation',
        status: 'success',
        ...debugMeta,
      });
    }
    res.status(200).json({
      ok: true,
      imageUrl,
      imageBase64: responseImageBase64,
      imageMeta,
      remaining_credits: isUnlimited ? 999_999 : getEffectiveCredits(user),
      trial_remaining: user.trialRemaining ?? 0,
      invite_remaining: user.inviteRemaining ?? 0,
      subscription_remaining: user.subscriptionRemaining ?? 0,
    });
  } catch (error: any) {
    const rawErrorText = JSON.stringify(error || {}).toLowerCase();
    const messageText = String(error?.message || '').toLowerCase();
    const isApiKeyInvalid =
      rawErrorText.includes('api_key_invalid') ||
      rawErrorText.includes('api key not valid') ||
      messageText.includes('api_key_invalid') ||
      messageText.includes('api key not valid');
    if (isApiKeyInvalid) {
      console.error('[GENAI] API_KEY_INVALID from server key in this deployment', {
        googleApiKeyLength: envApiKey.length,
        bodyApiKeyLength: bodyApiKey.length,
        apiKeySource: bodyApiKey ? 'body' : 'env',
        vercelEnv,
      });
      res.status(500).json({
        error: bodyApiKey
          ? 'CLIENT_GOOGLE_API_KEY_INVALID (Provided key is invalid or restricted)'
          : 'SERVER_GOOGLE_API_KEY_INVALID (Env key is invalid or restricted)',
      });
      return;
    }
    await addDebugLog('generate.error', {
      aspectRatio,
  model,
      promptHash: debugMeta?.promptHash,
      mode: debugMeta?.mode,
      sceneType: debugMeta?.sceneType,
      error: String(error?.message || 'Generation failed').slice(0, 280),
    }, email);
    if (!isAnonymousTrial && creditResult?.bucket) {
      await refundCredit(authenticatedEmail!, creditResult.bucket);
    }
    if (!isAnonymousTrial && creditResult?.bucket && creditResult.bucket !== 'admin') {
      await addActivity(authenticatedEmail!, 'image', { delta: 1, refund: true, bucket: creditResult.bucket });
      await addActivity(authenticatedEmail!, 'image', {
        kind: 'generation',
        status: 'error',
        error: String(error?.message || 'Generation failed').slice(0, 280),
        ...debugMeta,
      });
    }
    res.status(500).json({ error: error?.message || 'Generation failed' });
  }
}
