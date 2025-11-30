import { GoogleGenerativeAI } from "@google/generative-ai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Stable model name recommended by Google (no -latest, no version suffix)
const DEFAULT_MODEL = "models/gemini-1.5-flash";

// Normalizer to avoid breaking changes if Google changes suffixes
const normalizeGeminiModel = (raw?: string, fallback = DEFAULT_MODEL) => {
  let model = raw || fallback;

  model = model.replace(/^models\//, "models/");
  model = model.replace(/-latest$/, "-001");
  model = model.replace(/-002$/, "-001");

  return model;
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "GOOGLE_API_KEY is not configured on the server."
    });
  }

  try {
    const { promptText, image } = req.body;
    const base64 = image?.base64;
    const mimeType = image?.mimeType;

    if (!base64 || !mimeType || !promptText) {
      return res.status(400).json({
        error: "Missing required parameters: base64, mimeType, or prompt."
      });
    }

    // Load the updated v1 Google GenAI SDK
    const genAI = new GoogleGenerativeAI(apiKey);

    // Use the stable model name (no env var needed)
    const modelName = normalizeGeminiModel();

    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: promptText },
            {
              inlineData: {
                data: base64,
                mimeType
              }
            }
          ]
        }
      ]
    });

    const imagePart =
      result?.response?.candidates?.[0]?.content?.parts?.find(
        (p: any) => p.inlineData?.data
      );

    if (!imagePart) {
      throw new Error("No image returned by Gemini.");
    }

    const imageUrl = `data:${mimeType};base64,${imagePart.inlineData.data}`;
    return res.status(200).json({ imageUrl });

  } catch (error: any) {
    console.error("Error in /api/generate-image:", error);
    return res.status(500).json({
      error: error?.message || "Unknown server error"
    });
  }
}
