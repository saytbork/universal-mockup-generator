import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { generateCode } from "@/lib/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getTransport = () => {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
  });
};

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const normalized = (email || "").trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalized)) {
      return NextResponse.json(
        { error: "Enter a valid email address" },
        { status: 400 }
      );
    }

    const code = generateCode(normalized);
    const transport = getTransport();
    if (transport) {
      await transport.sendMail({
        from:
          process.env.SMTP_FROM ||
          process.env.EMAIL_FROM ||
          "BoostUGC <no-reply@boostugc.app>",
        to: normalized,
        subject: "Your BoostUGC access code",
        text: `Your code: ${code} (expires in 10 minutes)`,
        html: `<p>Your code:</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px;">${code}</p><p>Expires in 10 minutes.</p>`,
      });
    } else {
      console.warn(`Dev mode: code for ${normalized} is ${code}`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("send-code error", error);
    return NextResponse.json(
        { error: "Could not send code. Try again." },
        { status: 500 }
      );
  }
}
