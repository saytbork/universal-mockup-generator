/**
 * /api/wine-inpaint
 *
 * Hybrid pipeline for wine served mode:
 *   1. Receives the product reference image (base64) + prompt from App.tsx
 *   2. Calls Imagen 3 editImage with MASK_MODE_FOREGROUND to auto-segment the bottle
 *   3. The mask isolates the bottle interior (liquid + neck area)
 *   4. Imagen 3 inpaints only the masked region — label, geometry, background untouched
 *   5. Returns imageBase64 + imageUrl (Firebase) consistent with /api/generate contract
 *
 * WHY THIS WORKS (architecture):
 *   gemini-2.5-flash-image: single-pass text-guided generation. When a reference image
 *   is provided, the model treats visual structure as a strong prior. It has no internal
 *   segmentation — "liquid level" is not a separate visual object, it's baked into the
 *   bottle silhouette. preserveReferenceImage=false only reduces style anchoring, not
 *   structural geometric anchoring. The model reinterprets rather than structurally edits.
 *
 *   imagen-3 editImage + mask: diffusion inpainting operates on a pixel region defined
 *   by the mask. Outside the mask = identity-copied from source. Inside the mask =
 *   fully regenerated guided by the text prompt. The model cannot "see" the original
 *   liquid level inside the mask region — it only sees the prompt. This is the correct
 *   architecture for structural object-state editing (open/closed, full/half-empty).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, MaskReferenceImage, MaskReferenceMode, RawReferenceImage } from '@google/genai';
import crypto from 'crypto';
import { checkAuth } from '../server/lib/checkAuth.js';
import { consumeCredit, refundCredit, getUser, getEffectiveCredits, isUnlimitedCreditsEmail } from '../server/lib/store.js';
import { addActivity } from '../server/lib/activity.js';
import { addDebugLog } from '../server/lib/debugLog.js';
import { bucket } from '../server/lib/firebaseAdmin.js';
import sharp from 'sharp';

const IMAGEN3_MODEL = 'imagen-3.0-capability-001';

const parseBody = async (req: VercelRequest) => {
  if (req.body && typeof req.body === 'object') return req.body;
  let raw = '';
  for await (const chunk of req) { raw += chunk; }
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = await parseBody(req);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const {
    email,
    isPreview,
    bypassCreditLimits,
    isAdminUser,
    isUnlimited,
  } = await checkAuth(req) as any;

  const unlimitedEnv = Boolean(process.env.UNLIMITED_CREDITS === 'true');
  const bypassByCode = Boolean(body.bypassByCode);

  // ── Payload ───────────────────────────────────────────────────────────────
  // productImageBase64: the reference wine bottle image (closed/full retail)
  // prompt: natural language description of the desired served state
  const productImageBase64 = typeof body.productImageBase64 === 'string' ? body.productImageBase64 : '';
  const productMimeType = typeof body.productMimeType === 'string' ? body.productMimeType : 'image/png';
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  const aspectRatio = typeof body.aspectRatio === 'string' ? body.aspectRatio : '1:1';

  if (!productImageBase64) {
    res.status(400).json({ error: 'productImageBase64 is required' });
    return;
  }
  if (!prompt) {
    res.status(400).json({ error: 'prompt is required' });
    return;
  }

  const apiKey = String(process.env.GOOGLE_API_KEY || '').trim();
  if (!apiKey || !apiKey.startsWith('AIza')) {
    res.status(500).json({ error: 'GOOGLE_API_KEY not configured or invalid' });
    return;
  }

  // ── Credits ───────────────────────────────────────────────────────────────
  let creditResult: any = null;
  const authenticatedEmail = email;
  if (authenticatedEmail && !bypassCreditLimits && !isPreview && !unlimitedEnv) {
    creditResult = await consumeCredit(authenticatedEmail);
    if (!creditResult.ok || !creditResult.bucket) {
      res.status(402).json({ error: 'No credits remaining' });
      return;
    }
    if (creditResult.bucket !== 'admin') {
      await addActivity(authenticatedEmail, 'image', { delta: -1, bucket: creditResult.bucket });
    }
  }

  const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });

  try {
    // ── Build inpaint prompt ─────────────────────────────────────────────────
    // Short, descriptive natural language — Imagen 3 responds better to this
    // than structured technical tokens. The mask handles the "where", the prompt
    // handles the "what".
    const inpaintPrompt = [
      prompt,
      'The wine bottle is half-empty. Red or white wine fills only the bottom half of the bottle interior.',
      'The liquid surface is clearly visible at the midpoint of the bottle height.',
      'The top half of the bottle interior is empty air space.',
      'The bottle neck is open — no cap, cork, or closure attached.',
      'Exactly one detached closure is lying flat on the surface near the bottle base.',
      'A wine glass filled to one-third with wine is present next to the bottle.',
      'Preserve the exact bottle shape, label design, glass material, and background from the reference.',
    ].join(' ');

    // ── Call Imagen 3 editImage with foreground mask ─────────────────────────
    // MASK_MODE_FOREGROUND: Imagen 3 auto-segments the primary foreground object
    // (the wine bottle) and generates a mask covering it. Only the masked region
    // is re-diffused. Background, surface, and surrounding scene are identity-copied.
    //
    // maskDilation: 0.02 expands the mask slightly to catch the neck/closure area
    // without bleeding into the background.
    const response = await ai.models.editImage({
      model: IMAGEN3_MODEL,
      prompt: inpaintPrompt,
      referenceImages: [
        // Source image: the retail/closed wine bottle reference
        Object.assign(new RawReferenceImage(), {
          referenceImage: { imageBytes: productImageBase64 },
          referenceId: 1,
        }),
        // Auto-generated foreground mask over the bottle
        Object.assign(new MaskReferenceImage(), {
          referenceId: 1,
          config: {
            maskMode: MaskReferenceMode.MASK_MODE_FOREGROUND,
            maskDilation: 0.02,
          },
        }),
      ],
      config: {
        numberOfImages: 1,
        aspectRatio,
        negativePrompt: [
          'full wine bottle',
          'bottle filled to the top',
          'retail full bottle',
          'closure attached to neck',
          'cap on bottle neck',
          'cork in bottle neck',
          'sealed bottle',
          'unopened bottle',
          'two closures',
          'multiple caps',
        ].join(', '),
      },
    });

    const generatedImage = response?.generatedImages?.[0];
    const imageBytes = generatedImage?.image?.imageBytes;

    if (!imageBytes) {
      throw new Error('Imagen 3 inpaint returned no image.');
    }

    // ── Store to Firebase ────────────────────────────────────────────────────
    const buffer = Buffer.from(imageBytes, 'base64');
    const fileName = `generations/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.png`;
    const file = bucket.file(fileName);
    await file.save(buffer, {
      metadata: { contentType: 'image/png', cacheControl: 'public, max-age=31536000, immutable' },
    });
    await file.makePublic();
    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    await addDebugLog('wine-inpaint.success', {
      aspectRatio,
      model: IMAGEN3_MODEL,
      imageUrl,
    }, authenticatedEmail);

    if (authenticatedEmail && creditResult?.bucket !== 'admin') {
      await addActivity(authenticatedEmail, 'image', {
        kind: 'generation',
        status: 'success',
        model: IMAGEN3_MODEL,
      });
    }

    const userRecord = authenticatedEmail ? await getUser(authenticatedEmail) : null;
    const unlimitedUser = authenticatedEmail ? isUnlimitedCreditsEmail(authenticatedEmail) : false;

    res.status(200).json({
      ok: true,
      imageUrl,
      imageBase64: imageBytes,
      remaining_credits: (isUnlimited || unlimitedUser) ? 999_999 : (userRecord ? getEffectiveCredits(userRecord) : 0),
    });

  } catch (error: any) {
    await addDebugLog('wine-inpaint.error', {
      error: String(error?.message || 'Inpaint failed').slice(0, 280),
    }, authenticatedEmail);

    if (authenticatedEmail && creditResult?.bucket) {
      await refundCredit(authenticatedEmail, creditResult.bucket);
    }

    console.error('[WINE INPAINT ERROR]', error?.message || error);
    res.status(500).json({ error: error?.message || 'Wine inpaint failed' });
  }
}
