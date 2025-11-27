import { buildPrompt } from '../utils/promptBuilder.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GOOGLE_API_KEY is missing' });
  }

  const body = req.body || {};
  const settings = body.settings || {};
  const aspectRatio = settings.aspectRatio || '1:1';
  const modelName = process.env.IMAGEN_MODEL_NAME || 'imagen-3.0-generate-02';
  const finalPrompt = body.promptText || buildPrompt(settings);

  if (!finalPrompt || !String(finalPrompt).trim()) {
    return res.status(400).json({ error: 'Missing prompt text' });
  }

  try {
    // Vertex-style payload for Imagen 3 (predict)
    const payload = JSON.stringify({
      instances: [
        {
          prompt: finalPrompt,
        },
      ],
      parameters: {
        sampleCount: 1,
        aspectRatio,
        outputMimeType: 'image/png',
      },
    });

    // Debug logs to diagnose payload issues (keep key truncated)
    console.log('PAYLOAD SENT TO GOOGLE:', payload);
    console.log('MODEL:', modelName, 'API KEY last4:', apiKey.slice(-4));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${modelName}:predict?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      }
    );

    // Tolerant parsing: try JSON, if it fails capture raw text
    let data;
    const rawText = await response.text();
    console.log('GOOGLE STATUS:', response.status);
    console.log('GOOGLE HEADERS:', Object.fromEntries(response.headers));
    console.log('GOOGLE RAW:', rawText?.slice(0, 500) || '<empty>');
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch (parseErr) {
      data = { error: rawText || 'Non-JSON response from Imagen' };
    }

    if (data?.error?.message && String(data.error.message).toLowerCase().includes('safety')) {
      return res.status(403).json({
        error: 'Google blocked this generation due to safety filters. Try a safer prompt or remove sensitive content.',
        detail: data.error.message,
      });
    }

    if (!response.ok) {
      return res
        .status(response.status)
        .json({
          error: data?.error || 'Generation failed',
          detail: data?.detail || data?.message || null,
          raw: rawText || data,
          status: response.status,
          headers: Object.fromEntries(response.headers),
        });
    }

    const base64 =
      data?.predictions?.[0]?.bytesBase64Encoded ||
      data?.images?.[0]?.data ||
      data?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data ||
      null;

    if (!base64) {
      return res
        .status(500)
        .json({
          error: 'Image generation returned no image data',
          raw: rawText || data,
          status: 500,
          headers: Object.fromEntries(response.headers),
        });
    }

    const imageUrl = `data:image/png;base64,${base64}`;
    return res.status(200).json({ imageUrl, raw: data });
  } catch (error) {
    console.error('Error generating with Imagen:', error);
    return res.status(500).json({ error: 'Image generation failed', detail: String(error) });
  }
}
