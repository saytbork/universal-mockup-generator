import type { VercelRequest, VercelResponse } from "@vercel/node";

const MODEL_ID = "imagen-3.0-generate-001";
const API_KEY = process.env.GOOGLE_API_KEY || "";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { base64, mimeType, prompt } =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};

    if (!base64 || !mimeType || !prompt) {
      return res.status(400).json({
        error: "Missing required parameters: base64, mimeType, or prompt."
      });
    }

    const url = `https://generativelanguage.googleapis.com/v1/models/${MODEL_ID}:generateContent?key=${API_KEY}`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { data: base64, mimeType } },
            { text: prompt }
          ]
        }
      ]
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const json = await response.json();

    if (!response.ok) {
      console.error("Google API Error:", json);
      return res.status(500).json({
        error: json.error?.message || "Failed calling Google API"
      });
    }

    const imgPart =
      json?.candidates?.[0]?.content?.parts?.find(
        (p: any) => p.inlineData?.data
      );

    if (!imgPart) {
      return res.status(500).json({
        error: "Google API returned no image"
      });
    }

    const imageUrl = `data:${imgPart.inlineData.mimeType};base64,${imgPart.inlineData.data}`;

    return res.status(200).json({ imageUrl });

  } catch (error: any) {
    console.error("Error in /api/generate-image:", error);
    return res.status(500).json({
      error: error?.message || "Unknown server error"
    });
  }
}
