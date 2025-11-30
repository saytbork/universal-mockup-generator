import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const normalizeGeminiModel = (raw?: string, fallback = "gemini-2.5-flash") => {
  const model = (raw || fallback).replace(/^models\//, "");
  if (model.endsWith("-latest")) return model.replace(/-latest$/, "-001");
  if (model.endsWith("-002")) return model.replace(/-002$/, "-001");
  return model;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key is not configured on the server." });
  }

  const { base64, mimeType, prompt } = req.body || {};
  if (!base64 || !mimeType || !prompt) {
    return res.status(400).json({ error: "Missing required parameters: base64, mimeType, or prompt." });
  }

  const modelName = normalizeGeminiModel(process.env.GEMINI_MODEL);

  try {
    const client = new GoogleGenAI({ apiKey });
    const model = client.getGenerativeModel({ model: modelName });

    const result = await model.generateContent({
      contents: [
        {
          parts: [
            { inlineData: { data: base64, mimeType } },
            { text: prompt },
          ],
        },
      ],
    });

    const candidate = result.response?.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    const imagePart = parts.find((part: any) => part.inlineData && part.inlineData.data);

    if (imagePart?.inlineData?.data) {
      const imageUrl = `data:${mimeType};base64,${imagePart.inlineData.data}`;
      return res.status(200).json({ imageUrl });
    }

    throw new Error("Image generation failed or returned no image data.");
  } catch (error) {
    console.error("Error in /api/generate-image:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return res.status(500).json({ error: errorMessage });
  }
}
