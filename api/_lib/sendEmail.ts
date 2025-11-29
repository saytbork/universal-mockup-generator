import nodemailer from "nodemailer";

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const user = process.env.MAGIC_EMAIL_USER;
  const pass = process.env.MAGIC_EMAIL_PASS;

  if (!user || !pass) {
    throw new Error("MAGIC_EMAIL_USER or MAGIC_EMAIL_PASS is not set");
  }

  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user,
      pass,
    },
  });

  await transport.sendMail({
    from: "BoostUGC <no-reply@boostugc.app>",
    to,
    subject,
    html,
  });
}
