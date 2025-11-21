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
  const apiVersion = process.env.GEMINI_API_VERSION || 'v1';

  const MODEL_CANDIDATES: string[] = Array.from(
    new Set(
      [
        process.env.GEMINI_MODEL_ID,
        'gemini-1.5-flash-002',
        'gemini-1.5-flash',
      ].filter((model): model is string => Boolean(model))
    )
  );

  try {
    const { base64, mimeType, prompt } = req.body;

    if (!base64 || !mimeType || !prompt) {
      return res.status(400).json({ error: 'Missing required parameters: base64, mimeType, or prompt.' });
    }

    const ai = new GoogleGenAI({ apiKey, apiVersion });

    let lastError: any = null;
    let lastModel: string | null = null;
    for (const model of MODEL_CANDIDATES) {
      try {
        lastModel = model;
        const response = await ai.models.generateContent({
          model,
          contents: { parts: [{ inlineData: { data: base64, mimeType } }, { text: prompt }] },
          generationConfig: {
            responseMimeType: 'image/png',
          },
        });

        const imagePart =
          response.candidates?.[0]?.content?.parts?.find(
            (part) => 'inlineData' in part && !!(part as any).inlineData?.data
          );
        if (imagePart && 'inlineData' in imagePart) {
          const imageUrl = `data:image/png;base64,${(imagePart as any).inlineData.data}`;
          return res.status(200).json({ imageUrl, modelUsed: model });
        }
        throw new Error("Image generation failed or returned no image data.");
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes('NOT_FOUND') || message.toLowerCase().includes('not found')) {
          lastError = err;
          continue;
        }
        throw err;
      }
    }

    if (lastError) {
      console.error('generate-image: all models failed. Last model:', lastModel, 'error:', lastError);
      const message = lastError instanceof Error ? lastError.message : String(lastError);
      return res.status(500).json({ error: `Model failed: ${lastModel || 'unknown'} · ${message}` });
    }
    throw new Error("Image generation failed or returned no image data.");
  } catch (error) {
    console.error("Error in /api/generate-image:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return res.status(500).json({ error: errorMessage });
  }
}
