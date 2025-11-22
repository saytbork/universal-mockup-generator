import { GoogleGenAI, Modality } from "@google/genai";
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
    const { base64Image, prompt } = req.body;
    const apiVersion = process.env.GEMINI_API_VERSION || 'v1';
    const modelId = (process.env.GEMINI_MODEL_ID || 'gemini-3.0-flash').replace(/^models\//, '');

    if (!base64Image || !prompt) {
      return res.status(400).json({ error: 'Missing required parameters: base64Image or prompt.' });
    }

    const ai = new GoogleGenAI({ apiKey, apiVersion });
    
    const response = await ai.models.generateContent({
        model: modelId,
        contents: { parts: [{ inlineData: { data: base64Image, mimeType: 'image/png' } }, { text: prompt }] },
    });

    const imagePart =
      response.candidates?.[0]?.content?.parts?.find(
        (part) => 'inlineData' in part && !!(part as any).inlineData?.data
      );

    if (imagePart && 'inlineData' in imagePart) {
        const imageUrl = `data:image/png;base64,${(imagePart as any).inlineData.data}`;
        return res.status(200).json({ imageUrl });
    }

    throw new Error("Image edit failed or returned no image data.");
  } catch (error) {
    console.error("Error in /api/edit-image:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return res.status(500).json({ error: errorMessage });
  }
}
