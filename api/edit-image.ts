import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleAuth } from 'google-auth-library';

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
  const replicateModel = process.env.REPLICATE_MODEL || 'black-forest-labs/flux-pro-1.1';
  const replicateVersion =
    process.env.REPLICATE_MODEL_VERSION ||
    'c470cc1a2232c8f8997c7a1e3a07c5c612200a60c9a0127b0c5e4a94fc35693f';

  try {
    const { prompt = '', base64Image, mimeType } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: 'Missing required parameter: prompt.' });
    }

    // First choice: Replicate
    if (replicateToken) {
      const model = replicateModel;
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
            prompt,
            width: 1024,
            height: 1024,
            guidance_scale: 3,
            // If base64 provided, you could send it via control image in models that support it; Flux 1.1 doesn't take image input directly
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
    }

    // Fallback: Vertex Imagen
    if (!project || !saJson) {
      throw new Error('Missing GCP_PROJECT_ID or GCP_SERVICE_ACCOUNT_KEY for Vertex fallback.');
    }
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/imagen-3.0:predict`;

    const instance: Record<string, any> = { prompt };
    if (base64Image) {
      instance.image = { bytesBase64Encoded: base64Image, mimeType: mimeType || 'image/png' };
    }

    const body = {
      instances: [instance],
      parameters: {
        sampleCount: 1,
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
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.error?.message || 'Vertex Imagen edit failed');
    }

    const prediction = data?.predictions?.[0];
    const imageBase64 = prediction?.bytesBase64Encoded;
    if (!imageBase64) {
      throw new Error('No image returned from Vertex Imagen.');
    }

    const imageUrl = `data:image/png;base64,${imageBase64}`;
    return res.status(200).json({ imageUrl, promptUsed: prompt });
  } catch (error) {
    console.error("Error in /api/edit-image:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return res.status(500).json({ error: errorMessage });
  }
}
