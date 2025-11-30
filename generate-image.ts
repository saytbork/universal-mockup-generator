import { GoogleGenerativeAI } from "@google/generative-ai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Modelo recomendado por Google para generar imágenes
const MODEL_ID = "imagen-3.0-generate-001";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Solo usamos esta variable. Nada más.
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "GOOGLE_API_KEY is not configured on the server.",
    });
  }

  try {
    // Adaptación para compatibilidad con el frontend actual
    const { promptText, image, base64: directBase64, mimeType: directMimeType, prompt: directPrompt } = req.body;

    const base64 = image?.base64 || directBase64;
    const mimeType = image?.mimeType || directMimeType;
    const prompt = promptText || directPrompt;

    if (!base64 || !mimeType || !prompt) {
      return res.status(400).json({
        error: "Missing required parameters: base64, mimeType, or prompt.",
      });
    }

    // Nuevo cliente del SDK v1 estable
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: MODEL_ID,
    });

    // Llamada a Imagen 3 para generar mockups a partir de imagen + texto
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { data: base64, mimeType } },
            { text: prompt },
          ],
        },
      ],
    });

    // Extraer la imagen generada
    const part =
      result?.response?.candidates?.[0]?.content?.parts?.find(
        (p: any) => p.inlineData && p.inlineData.data
      );

    if (!part) {
      throw new Error("The model did not return any image data.");
    }

    const imageUrl = `data:image/png;base64,${part.inlineData.data}`;

    return res.status(200).json({ imageUrl });

  } catch (error: any) {
    console.error("Error in /api/generate-image:", error);
    return res.status(500).json({
      error: error.message || "Unknown server error",
    });
  }
}
