// @ts-ignore
import { createCanvas, loadImage } from 'canvas';

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleAuth } from 'google-auth-library';
import { checkAndConsumeCredit } from './utils/credits';

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
  // const replicateToken = process.env.REPLICATE_API_TOKEN;
  // const replicateModel = process.env.REPLICATE_MODEL || 'black-forest-labs/flux-pro-1.1';
  // const replicateVersion =
  //   process.env.REPLICATE_MODEL_VERSION ||
  //   'c470cc1a2232c8f8997c7a1e3a07c5c612200a60c9a0127b0c5e4a94fc35693f';
  const vertexImageModel = process.env.GCP_IMAGE_MODEL || 'imagegeneration@006';
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
    const { prompt = '', base64Image, maskBase64, mimeType } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: 'Missing required parameter: prompt.' });
    }

    // 🛑 A. Obtener el User ID de Clerk (El Gatekeeper principal)
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ message: "No autorizado. Debes iniciar sesión." });
    }

    // 🛑 B. Barrera de Créditos
    await checkAndConsumeCredit(userId);

    const safePrompt = sanitizePrompt(prompt);

    // First choice: Replicate - DISABLED per user request
    /*
    if (replicateToken) {
      try {
        const version = replicateVersion;
        const start = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${replicateToken}`,
          },
          body: JSON.stringify({
            version,
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
        if (!imageUrl) {
          throw new Error('Replicate returned no image URL.');
        }
        return res.status(200).json({ imageUrl, promptUsed: prompt });
      } catch (err) {
        console.warn('Replicate edit failed, trying Vertex:', err);
      }
    }
    */

    // Fallback: Vertex Imagen
    if (!project || !saJson) {
      throw new Error('Missing GCP_PROJECT_ID or GCP_SERVICE_ACCOUNT_KEY for Vertex fallback.');
    }
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${vertexImageModel}:predict`;

    const instance: Record<string, any> = {
      prompt: safePrompt,
      negativePrompt,
    };
    if (base64Image) {
      instance.image = { bytesBase64Encoded: base64Image, mimeType: mimeType || 'image/png' };

      // Use client-provided mask if available, otherwise try server-side generation
      if (maskBase64) {
        instance.mask = {
          image: { bytesBase64Encoded: maskBase64, mimeType: 'image/png' }
        };
      } else {
        // Fallback: Server-side mask generation (may fail on Vercel)
        try {
          const imgBuffer = Buffer.from(base64Image, 'base64');
          const img = await loadImage(imgBuffer);
          const canvas = createCanvas(img.width, img.height);
          const ctx = canvas.getContext('2d');

          // Fill with white (white = edit this area, black = keep)
          // For full variation, we mask everything.
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, img.width, img.height);

          const serverMaskBase64 = canvas.toBuffer('image/png').toString('base64');
          instance.mask = {
            image: { bytesBase64Encoded: serverMaskBase64, mimeType: 'image/png' }
          };
        } catch (maskError) {
          console.error('Failed to generate mask:', maskError);
          // Don't throw yet, check if we have a mask
        }
      }
    }

    if (!instance.mask) {
      throw new Error('Internal Error: Mask could not be generated for editing.');
    }

    const body = {
      instances: [instance],
      parameters: {
        sampleCount: 1,
        // personGeneration: 'allow_adult',
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        ],
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
      console.error('Vertex AI Edit Error Response:', errorText);
      throw new Error(`Vertex AI Edit Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const prediction = data?.predictions?.[0];
    const imageBase64 = prediction?.bytesBase64Encoded;

    if (!imageBase64) {
      console.error('Vertex AI Edit Response Data:', JSON.stringify(data, null, 2));
      throw new Error('No image returned from Vertex Imagen.');
    }

    const imageUrl = `data:image/png;base64,${imageBase64}`;
    return res.status(200).json({ imageUrl, promptUsed: safePrompt });
  } catch (error) {
    console.error("Error in /api/edit-image:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return res.status(500).json({ error: errorMessage });
  }
}
