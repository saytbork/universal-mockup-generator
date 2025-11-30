import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkAuth } from "../../server/lib/checkAuth.js";
import { addActivity } from "../../server/lib/activity.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  const email = checkAuth(req);
  res.setHeader("Set-Cookie", [
    `session_email=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
  ]);
  if (email) {
    await addActivity(email, "logout", {});
  }
  res.status(200).json({ ok: true });
}
