import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkAuth } from '../../server/lib/checkAuth.js';
import { retrieveSupportContext } from '../../server/lib/supportKnowledge.js';
import { sendEmail } from '../../server/lib/sendEmail.js';
import { rateLimit } from '../../server/lib/rateLimit.js';

const AI_ENABLED = String(process.env.SUPPORT_AI_ENABLED || '').toLowerCase() === 'true';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_SUPPORT_MODEL || 'gpt-4o-mini';
const DOCS_TOPK = Number(process.env.SUPPORT_AI_DOCS_TOPK || 3);
const DOCS_MAX_CHARS = Number(process.env.SUPPORT_AI_DOCS_MAX_CHARS || 6000);
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

const parseAction = (req: VercelRequest) => {
  const raw = req.query.action;
  if (Array.isArray(raw)) return raw[0]?.toString().toLowerCase() ?? '';
  return typeof raw === 'string' ? raw.toLowerCase() : '';
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

const getClientIp = (req: VercelRequest): string => {
  const xfwd = String(req.headers['x-forwarded-for'] || '').split(',')[0]?.trim();
  const realIp = String(req.headers['x-real-ip'] || '').trim();
  return xfwd || realIp || 'unknown';
};

const systemPrompt = (path?: string) => `
You are a support assistant for "Perfect Mockup" (a web app).
Goal: help the user use the product with short, concrete, step-by-step instructions.

Rules:
- Respond in English.
- Do not invent features. If product info is missing from the provided documentation, say you’re not sure and ask 1 focused question.
- Do not request or repeat sensitive data (passwords, card numbers, tokens).
- If the user asks for something unsafe/illegal, refuse and provide a safe alternative.

Product context (summary):
- Marketing site at / (pricing, blog, guides, FAQ).
- App at /app: requires sign-in (magic link email) and uses plans/credits.
- Exports/downloads and limits depend on plan; Stripe may be used for upgrades.
- Free plan exports may include a watermark.

Current user path: ${path || '/'}
`.trim();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const action = parseAction(req);
  if (action === 'contact') {
    const body = await parseBody(req);
    const authenticatedEmail = checkAuth(req) || undefined;
    const ip = getClientIp(req);
    const contactKey = authenticatedEmail ? `u:${authenticatedEmail}` : `ip:${ip}`;
    const contactLimit = await rateLimit({
      key: `support-contact:${contactKey}`,
      max: 5,
      windowSeconds: 600,
      namespace: 'support',
    });
    if (!contactLimit.ok) {
      res.status(429).json({ error: 'Too many requests. Please try again in a few minutes.' });
      return;
    }

    const recipient = trim(process.env.SUPPORT_CONTACT_EMAIL, DEFAULT_SUPPORT_CONTACT_EMAIL);
    if (!recipient) {
      res.status(500).json({ error: 'Support contact is not configured' });
      return;
    }

    const account = trim(body.account, authenticatedEmail || 'unknown');
    const plan = trim(body.plan, 'unknown');
    const page = trim(body.page, 'unknown');
    const credits = String(body.credits ?? 'unknown').trim();
    const transcript = trim(body.transcript, '').slice(0, 6000);

    const subject = `Support request${account !== 'unknown' ? `: ${account}` : ''}`;
    const html = `
      <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.45;">
        <h2 style="margin: 0 0 12px;">Support request</h2>
        <p><strong>Account:</strong> ${escapeHtml(account)}</p>
        <p><strong>Authenticated:</strong> ${escapeHtml(authenticatedEmail || 'none')}</p>
        <p><strong>Plan:</strong> ${escapeHtml(plan)}</p>
        <p><strong>Credits:</strong> ${escapeHtml(credits)}</p>
        <p><strong>Page:</strong> ${escapeHtml(page)}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <hr style="margin: 16px 0; border: 0; border-top: 1px solid #ddd;" />
        <p><strong>Transcript</strong></p>
        <pre style="white-space: pre-wrap; background: #f8f8f8; border: 1px solid #eee; padding: 12px; border-radius: 8px;">${escapeHtml(
          transcript || '(empty)'
        )}</pre>
      </div>
    `;

    try {
      await sendEmail({ to: recipient, subject, html });
      res.status(200).json({ ok: true });
      return;
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Failed to send support request' });
      return;
    }
  }

  if (!AI_ENABLED) {
    res.status(503).json({ error: 'Support assistant disabled', reply: 'The support assistant is not enabled yet.' });
    return;
  }

  if (!OPENAI_API_KEY) {
    res.status(500).json({ error: 'Missing OPENAI_API_KEY', reply: 'Support assistant is not configured.' });
    return;
  }

  const email = checkAuth(req) || undefined;
  const ip = getClientIp(req);
  const rlKey = email ? `u:${email}` : `ip:${ip}`;
  const rl = await rateLimit({
    key: rlKey,
    max: Number(process.env.SUPPORT_AI_RL_MAX || 20),
    windowSeconds: 60 * 10,
    namespace: 'support-chat',
  });
  if (!rl.ok) {
    res.status(429).json({ error: 'Rate limited', reply: 'Too many requests. Please try again in a few minutes.' });
    return;
  }

  const body = await parseBody(req);
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const path = typeof body.path === 'string' ? body.path.trim() : '';

  if (!message) {
    res.status(400).json({ error: 'Missing message' });
    return;
  }

  try {
    const retrieved = retrieveSupportContext(message, {
      topK: Number.isFinite(DOCS_TOPK) ? Math.max(1, Math.min(6, DOCS_TOPK)) : 3,
      maxChars: Number.isFinite(DOCS_MAX_CHARS) ? Math.max(1500, Math.min(12000, DOCS_MAX_CHARS)) : 6000,
    });
    const contextBlock = retrieved.context
      ? `Relevant product documentation (use this to answer product questions; if missing, ask 1 clarifying question):\n\n${retrieved.context}`
      : '';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.2,
        messages: [
          { role: 'system', content: systemPrompt(path) },
          ...(contextBlock ? [{ role: 'system', content: contextBlock }] : []),
          { role: 'user', content: message },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      res.status(502).json({ error: `OpenAI error: ${response.status}`, details: text, reply: 'I had an issue contacting the assistant.' });
      return;
    }

    const data = (await response.json()) as any;
    const reply = String(data?.choices?.[0]?.message?.content ?? '').trim();
    if (!reply) {
      res.status(502).json({ error: 'Empty reply', reply: 'I could not generate a response. Please rephrase your question.' });
      return;
    }

    res.status(200).json({ ok: true, reply, remaining: rl.remaining });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Support failed', reply: 'Internal error. Please try again.' });
  }
}
