import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

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

    // OpenAI path
    if (imageEngine === 'openai') {
      const openaiKey = process.env.OPENAI_API_KEY;
      if (!openaiKey) {
        return res.status(500).json({ error: 'OPENAI_API_KEY is not configured.' });
      }
      const client = new OpenAI({ apiKey: openaiKey });
      // Map aspect ratio to size supported by DALL-E 3
      const sizeMap: Record<string, OpenAI.Images.ImageGenerateParams['size']> = {
        '1:1': '1024x1024',
        '16:9': '1792x1024',
        '9:16': '1024x1792',
        '4:5': '1024x1280',
        '3:4': '1024x1365',
      };
      const size = sizeMap[aspectRatio] || '1024x1024';
      const response = await client.images.generate({
        model: 'dall-e-3',
        prompt,
        size,
        quality: 'standard',
        n: 1,
      });
      const b64 = response.data?.[0]?.b64_json;
      if (!b64) {
        throw new Error('OpenAI did not return an image.');
      }
      const imageUrl = `data:image/png;base64,${b64}`;
      return res.status(200).json({ imageUrl });
    }

    // Gemini default
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1' });

    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: { parts: [{ inlineData: { data: base64, mimeType } }, { text: prompt }] },
      generationConfig: { responseMimeType: 'image/png' },
    });

    const imagePart =
      response.candidates?.[0]?.content?.parts?.find(
        (part) => 'inlineData' in part && !!(part as any).inlineData?.data
      );
    if (imagePart && 'inlineData' in imagePart) {
        const imageUrl = `data:image/png;base64,${(imagePart as any).inlineData.data}`;
        return res.status(200).json({ imageUrl });
    }

    throw new Error("Image generation failed or returned no image data.");
  } catch (error) {
    console.error("Error in /api/generate-image:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return res.status(500).json({ error: errorMessage });
  }
}
