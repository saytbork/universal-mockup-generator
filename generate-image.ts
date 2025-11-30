import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// The model normalizer you recovered from your working version.
// THIS IS REQUIRED or Gemini will break.
const normalizeGeminiModel = (
  raw?: string,
  fallback = "gemini-2.5-flash"
) => {
  const model = (raw || fallback).replace(/^models\//, "");
  if (model.endsWith("-latest")) return model.replace(/-latest$/, "-001");
  if (model.endsWith("-002")) return model.replace(/-002$/, "-001");
  return model;
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Your real variable. Do NOT change this.
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "GOOGLE_API_KEY is not configured on the server."
    });
  }

  try {
    const { base64, mimeType, prompt } = req.body;

    if (!base64 || !mimeType || !prompt) {
      return res.status(400).json({
        error: "Missing required parameters: base64, mimeType, or prompt."
      });
    }

    const genAI = new GoogleGenAI({ apiKey });

    const modelName = normalizeGeminiModel("gemini-2.5-flash");

    const model = genAI.getGenerativeModel({
      model: modelName
    });

    // The correct API call for Gemini 2.5 Flash
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64,
          mimeType
        }
      },
      {
        text: prompt
      }
    ]);

    // Correct extraction of image response
    const part =
      result?.response?.candidates?.[0]?.content?.parts?.find(
        (p: any) => p.inlineData
      );

    if (!part || !part.inlineData?.data) {
      throw new Error("Gemini did not return image inlineData.");
    }

    const imageUrl = `data:image/png;base64,${part.inlineData.data}`;

    return res.status(200).json({ imageUrl });
  } catch (error: any) {
    console.error("Error in /api/generate:", error);
    return res.status(500).json({
      error: error?.message || "Unknown server error"
    });
  }
}
