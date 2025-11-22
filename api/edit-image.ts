import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key is not configured on the server." });
  }

  try {
    const { prompt } = req.body || {};
    const apiVersion = process.env.GEMINI_API_VERSION || 'v1beta';
    const modelId = (process.env.GEMINI_MODEL_ID || 'gemini-1.5-flash').replace(/^models\//, '');

    if (!prompt) {
      return res.status(400).json({ error: 'Missing required parameter: prompt.' });
    }

    const ai = new GoogleGenAI({ apiKey, apiVersion });

    let masterPrompt = prompt;
    try {
      const response = await ai.models.generateContent({
        model: modelId,
        contents: [{ text: `You are an image editing prompt designer. Refine this edit request with concise, realistic guidance: ${prompt}` }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 256,
        },
      });
      const text =
        response.candidates?.[0]?.content?.parts
          ?.map(part => (part as any).text ?? '')
          .join('')
          .trim() || '';
      if (text) {
        masterPrompt = text;
      }
    } catch (err) {
      console.warn('Gemini edit prompt expansion failed, returning base prompt:', err);
    }

    const mockImageUrl = 'https://via.placeholder.com/900x900/43A047/FFFFFF?text=BOOSTUGC+EDIT+MOCK';
    return res.status(200).json({ imageUrl: mockImageUrl, masterPrompt });
  } catch (error) {
    console.error("Error in /api/edit-image:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return res.status(500).json({ error: errorMessage });
  }
}
