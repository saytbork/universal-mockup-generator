import { GoogleGenAI, Modality } from "@google/genai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key is not configured on the server." });
  }

  try {
    const { base64, mimeType, prompt } = req.body;

    if (!base64 || !mimeType || !prompt) {
      return res.status(400).json({ error: "Missing required parameters: base64, mimeType, or prompt." });
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: { parts: [{ inlineData: { data: base64, mimeType } }, { text: prompt }] },
      config: {
        responseMimeType: "image/png",
      },
    });

    const imagePart = response.response.parts[0];
    if (imagePart && "inlineData" in imagePart) {
      const imageUrl = `data:image/png;base64,${imagePart.inlineData.data}`;
      return res.status(200).json({ imageUrl });
    }

    throw new Error("Image generation failed or returned no image data.");
  } catch (error) {
    console.error("Error in /api/generate-image:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return res.status(500).json({ error: errorMessage });
  }
}
