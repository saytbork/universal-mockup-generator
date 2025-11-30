import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Usamos exclusivamente la API v1
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// ID correcto del modelo Imagen 3
const MODEL_ID = "imagen-3.0-generate-001";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Solo aceptamos POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { prompt } = typeof req.body === "string"
      ? JSON.parse(req.body || "{}")
      : req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        error: "Missing or invalid 'prompt'. Expected a non-empty string."
      });
    }

    // Crear cliente del modelo
    const model = genAI.getGenerativeModel({ model: MODEL_ID });

    // Llamar al modelo (solo prompt)
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    });

    // Buscar resultado en Base64
    const imgPart =
      result?.response?.candidates?.[0]?.content?.parts?.find(
        (p: any) => p.inlineData?.data
      );

    if (!imgPart) {
      return res.status(500).json({
        error: "No image returned by Google Generative AI."
      });
    }

    const base64 = imgPart.inlineData.data;
    const mimeType = imgPart.inlineData.mimeType || "image/jpeg";

    const dataURL = `data:${mimeType};base64,${base64}`;

    return res.status(200).json({
      ok: true,
      imageUrl: dataURL
    });

  } catch (error: any) {
    console.error("Error in /api/generate-image:", error);

    return res.status(500).json({
      error: error?.message || "Unknown server error"
    });
  }
}
