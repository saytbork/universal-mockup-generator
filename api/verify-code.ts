import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  EMAIL_REGEX,
  clearVerificationCookie,
  normalizeEmail,
  parseVerificationCookie,
} from '../services/emailVerification';

const getRequestBody = (req: VercelRequest): Record<string, any> => {
  try {
    if (!req.body) return {};
    if (typeof req.body === 'string') {
      return JSON.parse(req.body || '{}');
    }
    return req.body as Record<string, any>;
  } catch {
    return {};
  }
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const body = getRequestBody(req);
  const rawEmail = (body.email ?? '').trim();
  const submittedCode = String(body.code ?? '').trim();
  const normalizedEmail = normalizeEmail(rawEmail);

  if (!EMAIL_REGEX.test(rawEmail)) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }
  if (!submittedCode) {
    return res
      .status(400)
      .json({ error: 'Enter the verification code sent to your email.' });
  }

  const parsed = parseVerificationCookie(req.headers.cookie || null);
  if (!parsed || parsed.email !== normalizedEmail) {
    return res
      .status(400)
      .json({ error: 'Code expired or not found. Request a new one.' });
  }

  if (parsed.expiresAt < Date.now()) {
    res.setHeader('Set-Cookie', clearVerificationCookie());
    return res.status(400).json({ error: 'Code expired. Request a new one.' });
  }

  if (parsed.code !== submittedCode) {
    return res.status(400).json({ error: 'Incorrect code. Try again.' });
  }

  res.setHeader('Set-Cookie', clearVerificationCookie());
  res.setHeader('Cache-Control', 'no-store');
  return res.json({ verified: true });
}
