import type { VercelRequest, VercelResponse } from "@vercel/node";
import generateImage from "./generate-image";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await generateImage(req, res);
  } catch (error) {
    console.error("Error in /api/generate:", error);
    const msg = error instanceof Error ? error.message : "Internal error";
    res.status(500).json({ error: msg });
  }
}
