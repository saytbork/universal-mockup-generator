import type { VercelRequest, VercelResponse } from "@vercel/node";
import generateImage from "../generate-image.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await generateImage(req, res);
  } catch (error) {
    console.error("Error in /api/generate:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ error: message });
  }
}
