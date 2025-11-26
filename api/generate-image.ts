import fetch from 'node-fetch';
import Replicate from 'replicate';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const aspectMap: Record<string, { width: number; height: number }> = {
  '1:1': { width: 1024, height: 1024 },
  '16:9': { width: 1536, height: 864 },
  '9:16': { width: 864, height: 1536 },
  '4:5': { width: 1024, height: 1280 },
  '3:4': { width: 1024, height: 1365 },
};

const normalizeImageInput = (input: string, mimeType?: string) => {
  let data = input;
  let mt = mimeType || 'image/png';
  const dataUrlMatch = input.match(/^data:(.+);base64,(.*)$/);
  if (dataUrlMatch) {
    mt = dataUrlMatch[1] || mt;
    data = dataUrlMatch[2] || '';
  }
  return { data, mimeType: mt };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const replicateToken = process.env.REPLICATE_API_TOKEN;
  const envModel = process.env.REPLICATE_MODEL;
  const safeModel =
    envModel && !envModel.startsWith('runwayml/stable-diffusion-v1-5')
      ? envModel
      : 'black-forest-labs/flux-1-pro';
  const replicateModel = safeModel;
  const replicateModelVersion = process.env.REPLICATE_MODEL_VERSION;
  const allowPollinations = false; // Pollinations disabled (does not respect input image)
  const imageEngine = (process.env.IMAGE_ENGINE || 'replicate').toLowerCase();

  try {
    const { base64, mimeType, prompt, aspectRatio = '1:1' } = req.body;
    if (!base64 || !mimeType || !prompt) {
      return res.status(400).json({ error: 'Missing required parameters: base64, mimeType, or prompt.' });
    }
    const { data: safeBase64, mimeType: safeMime } = normalizeImageInput(base64, mimeType);
    if (!safeBase64) {
      return res.status(400).json({ error: 'Invalid image payload (empty base64).' });
    }

    if (imageEngine !== 'replicate') {
      return res.status(400).json({ error: 'IMAGE_ENGINE must be replicate for this setup.' });
    }
    if (!replicateToken) {
      return res.status(500).json({ error: 'REPLICATE_API_TOKEN is missing.' });
    }

    const wh = aspectMap[aspectRatio] || aspectMap['1:1'];
    const replicate = new Replicate({ auth: replicateToken });
    const input: Record<string, unknown> = {
      prompt,
      image: `data:${safeMime || 'image/png'};base64,${safeBase64}`,
      prompt_strength: 0.8,
      num_outputs: 1,
      width: wh.width,
      height: wh.height,
    };

    const primaryModelId = replicateModelVersion ? `${replicateModel}:${replicateModelVersion}` : replicateModel;
    const fallbackModelId = 'black-forest-labs/flux-1-schnell';

    const runReplicate = async (modelId: string) => {
      const output = await replicate.run(modelId, { input });
      const url = Array.isArray(output) ? output[0] : typeof output === 'string' ? output : null;
      return url ?? null;
    };

    let url: string | null = null;
    try {
      url = await runReplicate(primaryModelId);
    } catch (err) {
      console.error(`Replicate primary model failed (${primaryModelId}):`, err);
    }

    if (!url && primaryModelId !== fallbackModelId) {
      try {
        url = await runReplicate(fallbackModelId);
      } catch (err) {
        console.error(`Replicate fallback model failed (${fallbackModelId}):`, err);
      }
    }

    if (url) {
      return res.status(200).json({ imageUrl: url, engine: 'replicate' });
    }

    if (allowPollinations) {
      const pollUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${wh.width}&height=${wh.height}&model=flux`;
      const pollRes = await fetch(pollUrl);
      if (pollRes.ok) {
        const buf = await pollRes.arrayBuffer();
        const b64 = Buffer.from(buf).toString('base64');
        const imageUrl = `data:image/jpeg;base64,${b64}`;
        return res.status(200).json({ imageUrl, engine: 'pollinations', note: 'Replicate returned no image/text' });
      }
    }

    return res.status(500).json({ error: 'Image generation failed (no output from Replicate).' });
  } catch (error) {
    console.error('Error in /api/generate-image:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(500).json({ error: errorMessage });
  }
}
