import nodemailer from "nodemailer";

export async function sendEmail(to: string, subject: string, html: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.MAGIC_EMAIL_USER,
      pass: process.env.MAGIC_EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"BoostUGC" <${process.env.FROM_EMAIL}>`,
    to,
    subject,
    html,
  });
}
