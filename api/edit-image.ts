import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.VERTEX_API_KEY || process.env.GEMINI_API_KEY;
  const project = process.env.VERTEX_PROJECT_ID;
  const location = process.env.VERTEX_LOCATION || 'us-central1';
  if (!apiKey || !project) {
    return res.status(500).json({ error: "VERTEX_API_KEY and VERTEX_PROJECT_ID must be configured on the server." });
  }

  try {
    const { prompt = '', base64Image, mimeType } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: 'Missing required parameter: prompt.' });
    }

    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/imagen-3.0:predict?key=${apiKey}`;

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

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
