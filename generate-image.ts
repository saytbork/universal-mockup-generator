import { GoogleGenerativeAI } from "@google/generative-ai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const normalizeGeminiModel = (
  raw?: string,
  fallback = "models/gemini-1.5-flash-latest"
) => {
  return raw || fallback;
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
    const { settings, promptText, image } = req.body;
    const base64 = image?.base64;
    const mimeType = image?.mimeType;
    const prompt = promptText;

    if (!base64 || !mimeType || !prompt) {
      return res.status(400).json({
        error: "Missing required parameters: base64, mimeType, or prompt."
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: normalizeGeminiModel(process.env.GEMINI_MODEL)
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
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
    console.error("Error in /api/generate:", error);
    return res.status(500).json({
      error: error?.message || "Unknown server error"
    });
  }
}
