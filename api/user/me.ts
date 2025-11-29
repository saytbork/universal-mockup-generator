import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkAuth } from "../_lib/checkAuth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const email = checkAuth(req);
  if (!email) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.status(200).json({ email });
}
