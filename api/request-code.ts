import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  EMAIL_REGEX,
  MAIL_FROM,
  buildVerificationCookie,
  generateVerificationCode,
  getMailTransport,
  normalizeEmail,
} from '../services/emailVerification';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const rawEmail = (req.body?.email ?? '').trim();
    const normalizedEmail = normalizeEmail(rawEmail);
    if (!EMAIL_REGEX.test(rawEmail)) {
      return res.status(400).json({ error: 'Enter a valid email address.' });
    }

    const code = generateVerificationCode();
    const cookie = buildVerificationCookie(normalizedEmail, code);
    res.setHeader('Set-Cookie', cookie);
    res.setHeader('Cache-Control', 'no-store');

    const transport = getMailTransport();
    if (transport) {
      await transport.sendMail({
        from: MAIL_FROM,
        to: rawEmail,
        subject: 'Your access code',
        text: `Use this verification code to access the generator: ${code}\n\nThe code expires in 5 minutes.`,
        html: `<p>Use this verification code to access the generator:</p><p style="font-size:24px;font-weight:bold;letter-spacing:6px;">${code}</p><p>This code expires in 5 minutes.</p>`,
      });
    } else {
      console.warn(`Verification code for ${rawEmail}: ${code}`);
    }

    return res.json({ ok: true, emailed: Boolean(transport) });
  } catch (error) {
    console.error('request-code error', error);
    return res
      .status(500)
      .json({ error: 'Could not send verification email. Try again.' });
  }
}
