import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Modality } from '@google/genai';
import { checkAuth } from '../server/lib/checkAuth.js';
import { consumeCredit, refundCredit, getUser, getEffectiveCredits, isUnlimitedCreditsEmail } from '../server/lib/store.js';
import { addActivity } from '../server/lib/activity.js';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const email = checkAuth(req);
  if (!email) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const isUnlimited = isUnlimitedCreditsEmail(email);

  const body = await parseBody(req);
  const parts = Array.isArray(body.parts) ? body.parts : null;
  const model = typeof body.model === 'string' && body.model.trim() ? body.model.trim() : 'gemini-2.0-flash-preview-image-generation';
  const aspectRatio = typeof body.aspectRatio === 'string' ? body.aspectRatio : '1:1';
  const preserveReferenceImage = Boolean(body.preserveReferenceImage);
  const apiKey = typeof body.apiKey === 'string' && body.apiKey.trim() ? body.apiKey.trim() : process.env.GOOGLE_API_KEY;
  const rawDebugMeta = body?.debugMeta && typeof body.debugMeta === 'object' ? body.debugMeta : null;
  const debugMeta = rawDebugMeta
    ? {
        promptHash: typeof rawDebugMeta.promptHash === 'string' ? rawDebugMeta.promptHash.slice(0, 128) : undefined,
        sceneType: typeof rawDebugMeta.sceneType === 'string' ? rawDebugMeta.sceneType.slice(0, 64) : undefined,
        mode: typeof rawDebugMeta.mode === 'string' ? rawDebugMeta.mode.slice(0, 64) : undefined,
        aspectRatio: typeof rawDebugMeta.aspectRatio === 'string' ? rawDebugMeta.aspectRatio.slice(0, 16) : undefined,
      }
    : null;

  if (!apiKey) {
    res.status(400).json({ error: 'Missing API key' });
    return;
  }
  if (!parts || parts.length === 0) {
    res.status(400).json({ error: 'Missing prompt parts' });
    return;
  }

  const creditResult = await consumeCredit(email);
  if (!creditResult.ok || !creditResult.bucket) {
    res.status(402).json({ error: 'No credits remaining' });
    return;
  }
  if (creditResult.bucket !== 'admin') {
    await addActivity(email, 'image', { delta: -1, bucket: creditResult.bucket });
  }

  const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });

  try {
    const generateWithRetry = async () => {
      const maxAttempts = 4;
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          return await ai.models.generateContent({
            model,
            contents: { parts },
            config: {
              responseModalities: [Modality.IMAGE],
              safetySettings: [],
              generationConfig: {
                responseMimeType: 'image/png',
                aspectRatio,
                preserveReferenceImage,
                temperature: 0.25,
                topP: 0.9,
                seed: crypto.randomUUID(),
              },
            } as any,
          });
        } catch (error) {
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
          if (!shouldRetry) throw error;
          await new Promise(resolve => setTimeout(resolve, 600 * attempt * attempt));
        }
      }
      throw new Error('Image generation failed after retries.');
    };

    const response = await generateWithRetry();
    const responseParts = response?.candidates?.[0]?.content?.parts ?? [];
    const inlineImage = responseParts.find((part: any) => part?.inlineData?.data) as { inlineData?: { data?: string } } | undefined;
    const encodedImage = inlineImage?.inlineData?.data;
    if (!encodedImage) {
      throw new Error('Image generation failed.');
    }
    const user = await getUser(email);
    if (creditResult.bucket !== 'admin') {
      await addActivity(email, 'image', {
        kind: 'generation',
        status: 'success',
        ...debugMeta,
      });
    }
    res.status(200).json({
      ok: true,
      imageBase64: encodedImage,
      remaining_credits: isUnlimited ? 999_999 : getEffectiveCredits(user),
      trial_remaining: user.trialRemaining ?? 0,
      invite_remaining: user.inviteRemaining ?? 0,
      subscription_remaining: user.subscriptionRemaining ?? 0,
    });
  } catch (error: any) {
    await refundCredit(email, creditResult.bucket);
    if (creditResult.bucket !== 'admin') {
      await addActivity(email, 'image', { delta: 1, refund: true, bucket: creditResult.bucket });
      await addActivity(email, 'image', {
        kind: 'generation',
        status: 'error',
        error: String(error?.message || 'Generation failed').slice(0, 280),
        ...debugMeta,
      });
    }
    res.status(500).json({ error: error?.message || 'Generation failed' });
  }
}
