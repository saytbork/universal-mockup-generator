import { GoogleGenAI, Modality } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Support both key names for backward/forward compatibility
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key is not configured on the server." });
  }


  try {
    // Adapt to the current frontend payload structure
    // Frontend sends: { promptText, image: { base64, mimeType } }
    // Old code expected: { prompt, base64, mimeType }
    const { promptText, image, prompt, base64: directBase64, mimeType: directMimeType } = req.body;

    const finalPrompt = promptText || prompt;
    const finalBase64 = image?.base64 || directBase64;
    const finalMimeType = image?.mimeType || directMimeType;

    // Default to v1beta as it was working in the referenced commit, but allow override
    const apiVersion = process.env.GEMINI_API_VERSION || 'v1beta';
    // Default to flash model as in the referenced commit
    const modelId = (process.env.GEMINI_MODEL_ID || process.env.GEMINI_MODEL || 'gemini-1.5-flash-002').replace(/^models\//, '');

    if (!finalBase64 || !finalMimeType || !finalPrompt) {
      return res.status(400).json({ error: 'Missing required parameters: base64, mimeType, or prompt.' });
    }

    const ai = new GoogleGenAI({ apiKey, apiVersion });

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { data: finalBase64, mimeType: finalMimeType } },
          { text: finalPrompt }
        ]
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
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
