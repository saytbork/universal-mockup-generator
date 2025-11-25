import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleAuth } from 'google-auth-library';
import { checkAndConsumeCredit } from './utils/credits.js';
import fetch from 'node-fetch';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const project = process.env.GCP_PROJECT_ID || process.env.VERTEX_PROJECT_ID;
  const location = process.env.GCP_LOCATION || process.env.VERTEX_LOCATION || 'us-central1';
  const saJson = process.env.GCP_SERVICE_ACCOUNT_KEY;
  const replicateToken = process.env.REPLICATE_API_TOKEN;
  const replicateModel = process.env.REPLICATE_MODEL || 'black-forest-labs/flux-schnell';
  const replicateVersion =
    process.env.REPLICATE_MODEL_VERSION ||
    'de67bb1367180e6c8c5b8e3a1391c72a7c8caa0c1b6b5be825e062e10bb126d9';
  const imageEngine = (process.env.IMAGE_ENGINE || 'vertex').toLowerCase(); // vertex | replicate | auto

  if (!project) {
    console.error('Missing GCP_PROJECT_ID or VERTEX_PROJECT_ID');
    return res.status(500).json({ error: 'Server configuration error: Missing Project ID' });
  }
  if (!saJson) {
    console.error('Missing GCP_SERVICE_ACCOUNT_KEY');
    return res.status(500).json({ error: 'Server configuration error: Missing Service Account Key' });
  }

  // Use Imagen 3 as primary (Vertex)
  const vertexImageModel = 'imagen-3.0-generate-001';

  // Safety prompt/negative prompt in English
  const negativePrompt =
    'nudity, sexual content, pornography, gore, violence, weapons, blood, minors, explicit content, suggestive poses, regulated content, drugs, smoking, vape, alcohol, self-harm, brutality, hate, offensive, bikini, lingerie';

  const sanitizePrompt = (raw: string): string => {
    const banned = [
      'nude', 'naked', 'lingerie', 'bikini', 'swimsuit', 'sexy', 'explicit', 'erotic',
      'blood', 'gore', 'weapon', 'gun', 'knife', 'violence', 'drugs', 'smoking', 'vape',
      'alcohol', 'minor', 'child', 'kid', 'teen'
    ];
    let safe = raw || '';
    banned.forEach(word => {
      const re = new RegExp(word, 'gi');
      safe = safe.replace(re, '');
    });
    return safe.trim();
  };

  try {
    const { base64, mimeType, prompt = '' } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: 'Missing required parameter: prompt.' });
    }

    // 🛑 A. Obtener el User ID de Clerk (El Gatekeeper principal)
    const isAuthDisabled = process.env.DISABLE_AUTH === '1';
    let userId: string | null = null;
    if (!isAuthDisabled) {
      try {
        const mod = await import('@clerk/nextjs/server');
        const auth = mod.getAuth?.(req as any);
        userId = auth?.userId ?? null;
      } catch (err) {
        console.warn('Clerk getAuth not available, falling back to unauthenticated', err);
      }
    } else {
      userId = 'preview-user';
    }

    if (!userId) {
      return res.status(401).json({ message: "No autorizado. Debes iniciar sesión." });
    }

    // 🛑 B. Barrera de Créditos (Protección de Costos)
    // Usaremos el ID de Clerk (ej: user_2a9p9...) como el user_id para Neon
    await checkAndConsumeCredit(userId);

    // Note: checkAndConsumeCredit throws if insufficient, so we don't need to check return value explicitly for false, 
    // but we can catch the specific error if we want custom 403 message, or let the general catch handle it.
    // The utility throws "Créditos insuficientes..." which will be caught below.

    let enhancedPrompt = sanitizePrompt(prompt);

    const forcedPrompt = process.env.VERTEX_FORCE_PROMPT?.trim();
    const safePrompt = forcedPrompt
      ? forcedPrompt
      : `Safe, fully clothed, professional lifestyle/editorial product photo. ${enhancedPrompt}`;

    const allowReplicate = imageEngine === 'auto' && Boolean(replicateToken);
    const allowVertex = imageEngine !== 'replicate' && process.env.DISABLE_VERTEX !== '1';

    // 1) Try Replicate (Flux) if allowed and token present
    if (allowReplicate && replicateToken) {
      try {
        const start = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${replicateToken}`,
          },
          body: JSON.stringify({
            version: replicateVersion,
            input: {
              prompt: safePrompt,
              width: 1024,
              height: 1024,
              guidance_scale: 3,
              negative_prompt: negativePrompt,
            },
          }),
        });
        const startData = await start.json().catch(() => ({}));
        if (!start.ok) {
          throw new Error(startData?.error?.message || 'Replicate request failed');
        }
        const predictionId = startData.id;
        let status = startData.status;
        let output: any = startData.output;
        while (!['succeeded', 'failed', 'canceled'].includes(status)) {
          await new Promise(r => setTimeout(r, 3000));
          const poll = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
            headers: { Authorization: `Bearer ${replicateToken}` },
          });
          const pollData = await poll.json().catch(() => ({}));
          status = pollData.status;
          output = pollData.output;
          if (status === 'failed' || status === 'canceled') {
            throw new Error(pollData?.error || 'Replicate generation failed');
          }
        }
        const imageUrl = Array.isArray(output) ? output[0] : null;
        if (imageUrl) {
          return res.status(200).json({ imageUrl, promptUsed: safePrompt });
        }
        console.warn('Replicate returned no image, falling back to Vertex');
      } catch (err) {
        console.warn('Replicate failed, falling back to Vertex:', err);
      }
    }

    // 2) Fallback: Vertex Imagen 3 using service account
    if (!allowVertex) {
      throw new Error('Vertex generation disabled and Replicate failed.');
    }
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${vertexImageModel}:predict`;
    const instance: Record<string, any> = {
      prompt: `${safePrompt}\nNo sexual content, no violence, no weapons, no blood, no minors. Keep it safe lifestyle/editorial.`,
      negativePrompt,
    };
    if (base64) {
      instance.image = { bytesBase64Encoded: base64, mimeType: mimeType || 'image/png' };
    }
    const body = {
      instances: [instance],
      parameters: {
        sampleCount: 1,
        aspectRatio: '1:1',
        negativePrompt,
      },
    };
    const auth = new GoogleAuth({
      credentials: JSON.parse(saJson),
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.token}`,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vertex AI Error Response:', errorText);
      throw new Error(`Vertex AI Error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const data = await response.json();
    const prediction = data?.predictions?.[0];
    let imageBase64 = prediction?.bytesBase64Encoded;
    if (!imageBase64 && prediction?.structValue?.fields?.image?.stringValue) {
      imageBase64 = prediction.structValue.fields.image.stringValue;
    }
    if (!imageBase64) {
      console.error('Vertex AI Response Data:', JSON.stringify(data, null, 2));
      throw new Error('No image returned from Vertex Imagen.');
    }
    const imageUrl = `data:image/png;base64,${imageBase64}`;
    return res.status(200).json({ imageUrl, promptUsed: safePrompt });

  } catch (error) {
    console.error("Error in /api/generate-image:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return res.status(500).json({ error: errorMessage });
  }
}
