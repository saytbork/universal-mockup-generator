import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  auth: {
    user: process.env.MAGIC_EMAIL_USER,
    pass: process.env.MAGIC_EMAIL_PASS,
  },
});

const DEFAULT_FROM_NAME = "Perfect Mockup";

function parseSmtpFrom(value?: string): { name?: string; email?: string } {
  const raw = String(value || "").trim();
  if (!raw) return {};
  const match = raw.match(/^(?:"?([^"]*)"?\s*)?<([^>]+)>$/);
  if (match) {
    const name = String(match[1] || "").trim();
    const email = String(match[2] || "").trim();
    return { name: name || undefined, email: email || undefined };
  }
  return { email: raw };
}

function resolveFromHeader(): string {
  const parsed = parseSmtpFrom(process.env.SMTP_FROM);
  const fromName = String(process.env.FROM_NAME || parsed.name || DEFAULT_FROM_NAME).trim();
  const fromEmail = String(
    process.env.FROM_EMAIL || parsed.email || process.env.MAGIC_EMAIL_USER || ""
  ).trim();

  if (!fromEmail) {
    throw new Error("Missing sender email: set FROM_EMAIL or SMTP_FROM.");
  }

  return fromName ? `"${fromName}" <${fromEmail}>` : fromEmail;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  return transporter.sendMail({
    from: resolveFromHeader(),
    to,
    subject,
    html,
  });
}
