import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "crypto";
import { sendEmail } from "../../server/lib/sendEmail.js";
import { createMagicToken } from "../../server/lib/magicToken.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const { email, invitationCode } = req.body || {};
  if (!email) {
    res.status(400).json({ error: "Email required" });
    return;
  }

  const token = createMagicToken(email, invitationCode);
  const magicLink = `${process.env.BASE_URL ?? "https://boostugc.app"}/api/auth/verify?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Your BoostUGC access link",
    html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.5; color: #333;">
      <h2 style="color:#6D4AFF; margin-bottom: 16px;">Access your workspace</h2>
      <p>Click the button below to sign in to your BoostUGC workspace:</p>

      <p style="margin: 24px 0;">
        <a href="${magicLink}"
           style="display:inline-block; padding:12px 18px; background:#6D4AFF; color:#ffffff; text-decoration:none; border-radius:8px; font-size:16px;">
           Sign in to BoostUGC
        </a>
      </p>

      <p>If the button does not work, copy and paste the link below into your browser:</p>
      <p style="word-break: break-all;">${magicLink}</p>

      <hr style="margin: 32px 0; border: 0; border-top: 1px solid #ddd;" />

      <p style="font-size: 13px; color:#666;">
        If you did not request this email, you can safely ignore it.<br>
        Need help? Contact our support at
        <a href="mailto:${process.env.SUPPORT_EMAIL}" style="color:#6D4AFF;">${process.env.SUPPORT_EMAIL}</a>.
      </p>
    </div>
  `,
  });

  res.status(200).json({ ok: true });
}
