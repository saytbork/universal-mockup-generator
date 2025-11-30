import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkAuth } from "../../server/lib/checkAuth.js";
import { addActivity, ActivityRecord } from "../../server/lib/activity.js";

const ALLOWED_TYPES: ActivityRecord["type"][] = ["login", "image", "invite", "upgrade", "logout"];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const sessionEmail = checkAuth(req);
  const { type, meta, email } = req.body || {};
  const targetEmail = sessionEmail || email;

  if (!targetEmail) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  if (!type || !ALLOWED_TYPES.includes(type)) {
    res.status(400).json({ error: "Invalid activity type" });
    return;
  }

  const record = await addActivity(targetEmail, type, meta || {});
  res.status(200).json({ ok: true, record });
}
