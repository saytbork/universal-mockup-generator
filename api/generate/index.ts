import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildPrompt } from '../../utils/promptBuilder.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
  const modelName = process.env.IMAGEN_MODEL_NAME || 'gemini-2.5-flash';
  const finalPrompt = body.promptText || buildPrompt(settings);

  if (!finalPrompt || !String(finalPrompt).trim()) {
    return res.status(400).json({ error: 'Missing prompt text' });
  }

  try {
    const image = body.image;

    // Construct Gemini generateContent payload
    const parts: any[] = [{ text: finalPrompt }];

    if (image && image.base64) {
      parts.push({
        inlineData: {
          mimeType: image.mimeType || 'image/png',
          data: image.base64
        }
      });
    }

    const payload = JSON.stringify({
      contents: [{ parts }]
    });

    console.log('PAYLOAD SENT TO GOOGLE (Gemini):', JSON.stringify({ ...JSON.parse(payload), contents: '[HIDDEN]' })); // Hide huge base64 in logs
    console.log('MODEL:', modelName, 'API KEY last4:', apiKey.slice(-4));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
      }
    );

    let data: any;
    const rawText = await response.text();
    console.log('GOOGLE STATUS:', response.status);

    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      data = { error: rawText || 'Non-JSON response from Gemini' };
    }

    if (!response.ok) {
      console.error('Gemini Error:', data);
      return res.status(response.status).json({
        error: data?.error?.message || 'Generation failed',
        detail: data,
        status: response.status
      });
    }

    // Parse Gemini Response for Image
    // Gemini returns image in candidates[0].content.parts[0].inlineData (or executableCode sometimes)
    // For image generation models, it should be inlineData.

    const candidate = data?.candidates?.[0];
    const part = candidate?.content?.parts?.[0];
    const base64 = part?.inlineData?.data;
    const mimeType = part?.inlineData?.mimeType || 'image/jpeg';

    if (!base64) {
      console.error('No image data in Gemini response:', JSON.stringify(data).slice(0, 500));
      return res.status(500).json({
        error: 'No image generated',
        detail: 'The model returned a response but no image data was found.',
        raw: data
      });
    }

    const imageUrl = `data:${mimeType};base64,${base64}`;
    return res.status(200).json({ imageUrl, raw: data });

  } catch (error) {
    console.error('Error generating with Gemini:', error);
    return res.status(500).json({ error: 'Image generation failed', detail: String(error) });
  }
}
