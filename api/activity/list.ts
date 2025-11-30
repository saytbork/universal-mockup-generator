import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkAuth } from "../../server/lib/checkAuth.js";
import { listActivity } from "../../server/lib/activity.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const email = checkAuth(req);
  if (!email) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const limit = Number(req.query.limit) || 20;
  const items = await listActivity(email, limit);
  res.status(200).json({ activity: items });
}
