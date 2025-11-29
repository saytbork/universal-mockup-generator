import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "crypto";
import { sendEmail } from "../lib/sendEmail";
import { tokenStore } from "../lib/tokenStore";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const { email } = req.body || {};
  if (!email) {
    res.status(400).json({ error: "Email required" });
    return;
  }

  const token = randomUUID();
  const expires = Date.now() + 1000 * 60 * 15; // 15 minutes

  tokenStore[token] = { email, expires };

  const magicLink = `https://boostugc.app/auth/verify?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Your BoostUGC login link",
    html: `
      <p>Click to sign in:</p>
      <a href="${magicLink}">${magicLink}</a>
    `,
  });

  res.status(200).json({ ok: true });
}
