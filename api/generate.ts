import type { VercelRequest, VercelResponse } from "@vercel/node";
import handlerGenerateImage from "./generate-image";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await handlerGenerateImage(req, res);
  } catch (error) {
    console.error("Error in /api/generate:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ error: message });
  }
}
