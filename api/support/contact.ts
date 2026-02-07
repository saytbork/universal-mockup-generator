import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkAuth } from '../../server/lib/checkAuth.js';
import { sendEmail } from '../../server/lib/sendEmail.js';

const DEFAULT_SUPPORT_CONTACT_EMAIL = 'juanamisano@gmail.com';

const parseBody = async (req: VercelRequest) => {
  if (req.body && typeof req.body === 'object') return req.body;
  let raw = '';
  for await (const chunk of req) raw += chunk;
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const trim = (value: unknown, fallback = '') => {
  if (typeof value !== 'string') return fallback;
  return value.trim();
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const recipient = trim(process.env.SUPPORT_CONTACT_EMAIL, DEFAULT_SUPPORT_CONTACT_EMAIL);
  if (!recipient) {
    res.status(500).json({ error: 'Support contact is not configured' });
    return;
  }

  const body = await parseBody(req);
  const authenticatedEmail = checkAuth(req) || undefined;
  const account = trim(body.account, authenticatedEmail || 'unknown');
  const plan = trim(body.plan, 'unknown');
  const page = trim(body.page, 'unknown');
  const credits = String(body.credits ?? 'unknown').trim();
  const transcript = trim(body.transcript, '').slice(0, 6000);
  const safeAccount = escapeHtml(account);
  const safeAuthenticatedEmail = escapeHtml(authenticatedEmail || 'none');
  const safePlan = escapeHtml(plan);
  const safePage = escapeHtml(page);
  const safeCredits = escapeHtml(credits);
  const safeTranscript = escapeHtml(transcript || '(empty)');

  const subject = `Support request${account !== 'unknown' ? `: ${account}` : ''}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.45;">
      <h2 style="margin: 0 0 12px;">Support request</h2>
      <p><strong>Account:</strong> ${safeAccount}</p>
      <p><strong>Authenticated:</strong> ${safeAuthenticatedEmail}</p>
      <p><strong>Plan:</strong> ${safePlan}</p>
      <p><strong>Credits:</strong> ${safeCredits}</p>
      <p><strong>Page:</strong> ${safePage}</p>
      <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      <hr style="margin: 16px 0; border: 0; border-top: 1px solid #ddd;" />
      <p><strong>Transcript</strong></p>
      <pre style="white-space: pre-wrap; background: #f8f8f8; border: 1px solid #eee; padding: 12px; border-radius: 8px;">${safeTranscript}</pre>
    </div>
  `;

  try {
    await sendEmail({ to: recipient, subject, html });
    res.status(200).json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to send support request' });
  }
}
