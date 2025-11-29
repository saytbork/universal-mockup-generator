import type { VercelRequest, VercelResponse } from "@vercel/node";
import { tokenStore } from "../_lib/tokenStore";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { token } = req.query;

  if (!token || typeof token !== "string" || !tokenStore[token]) {
    res.status(400).send("Invalid or expired token");
    return;
  }

  const entry = tokenStore[token];
  if (Date.now() > entry.expires) {
    delete tokenStore[token];
    res.status(400).send("Token expired");
    return;
  }

  res.setHeader("Set-Cookie", [
    `session_email=${encodeURIComponent(entry.email)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
  ]);

  delete tokenStore[token];

  res.writeHead(302, { Location: "/dashboard" });
  res.end();
}
