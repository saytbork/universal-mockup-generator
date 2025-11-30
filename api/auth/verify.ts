import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyMagicToken } from "../../server/lib/magicToken.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    res.status(400).send("Invalid or expired token");
    return;
  }

  const parsed = verifyMagicToken(token);
  if (!parsed) {
    res.status(400).send("Invalid or expired token");
    return;
  }

  res.setHeader("Set-Cookie", [
    `session_email=${encodeURIComponent(parsed.email)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
  ]);

  res.writeHead(302, { Location: "/app" });
  res.end();
}
