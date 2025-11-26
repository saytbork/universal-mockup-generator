import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

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

  const normalizeModel = (raw?: string, fallback = 'gemini-2.5-flash') => {
    const model = (raw || fallback).replace(/^models\//, '');
    if (model.endsWith('-latest')) return model.replace(/-latest$/, '-001');
    if (model.endsWith('-002')) return model.replace(/-002$/, '-001');
    return model;
  };

  const MODEL_ID = normalizeModel(process.env.GEMINI_MODEL_ID);
  const imageEngine = (process.env.IMAGE_ENGINE || 'gemini').toLowerCase();

  try {
    const { base64, mimeType, prompt, aspectRatio = '1:1' } = req.body;

    if (!base64 || !mimeType || !prompt) {
      return res.status(400).json({ error: 'Missing required parameters: base64, mimeType, or prompt.' });
    }
    const { data: safeBase64, mimeType: safeMime } = normalizeImageInput(base64, mimeType);
    if (!safeBase64) {
      return res.status(400).json({ error: 'Invalid image payload (empty base64).' });
    }

    if (imageEngine !== 'gemini') {
      return res.status(400).json({ error: 'IMAGE_ENGINE must be gemini (OpenAI disabled for now).' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1' });
    const modelName = MODEL_ID.startsWith('models/') ? MODEL_ID : `models/${MODEL_ID}`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { data: safeBase64, mimeType: safeMime || 'image/png' } },
            { text: prompt },
          ],
        },
      ],
      generationConfig: { responseMimeType: 'image/png', aspectRatio },
    } as any);

    const imagePart =
      response.candidates?.[0]?.content?.parts?.find(
        (part) => 'inlineData' in part && !!(part as any).inlineData?.data
      );
    if (imagePart && 'inlineData' in imagePart) {
      const imageUrl = `data:image/png;base64,${(imagePart as any).inlineData.data}`;
      return res.status(200).json({ imageUrl });
    }

    throw new Error("Image generation failed or returned no image data (Gemini).");
  } catch (error) {
    console.error("Error in /api/generate-image:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return res.status(500).json({ error: errorMessage });
  }
}
