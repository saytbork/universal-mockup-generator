import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

const MODEL_ID = "imagen-3.0-generate-001";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "GOOGLE_API_KEY is not configured on the server.",
    });
  }

  try {
    const { promptText, image } = req.body;
    // Note: 'image' (base64) is received but Imagen 3 API via @google/genai 
    // primarily supports text-to-image. If editing is needed, we might need 
    // a different endpoint or model capability. 
    // For now, we proceed with text-to-image using the prompt.

    if (!promptText) {
      return res.status(400).json({
        error: "Missing required parameter: promptText.",
      });
    }

    const client = new GoogleGenAI({ apiKey });

    // Using the 'generateImage' method for Imagen 3
    const response = await client.models.generateImage({
      model: MODEL_ID,
      prompt: promptText,
      config: {
        numberOfImages: 1,
        aspectRatio: "1:1", // Default, can be adjusted if passed in body
        // safetySettings: ...
      }
    });

    if (!response || !response.image) {
      throw new Error("No image returned by Imagen.");
    }

    // The SDK returns the image bytes (base64) in the response
    const imageBase64 = response.image.imageBytes;

    if (!imageBase64) {
      throw new Error("No image data in response.");
    }

    // Return as data URL
    const imageUrl = `data:image/png;base64,${imageBase64}`;
    return res.status(200).json({ imageUrl });

  } catch (error: any) {
    console.error("Error in /api/generate-image:", error);
    return res.status(500).json({
      error: error?.message || "Unknown server error",
    });
  }
}
