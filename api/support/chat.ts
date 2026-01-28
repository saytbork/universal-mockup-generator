import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkAuth } from '../../server/lib/checkAuth.js';

const AI_ENABLED = String(process.env.SUPPORT_AI_ENABLED || '').toLowerCase() === 'true';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_SUPPORT_MODEL || 'gpt-4o-mini';

const hasKV =
  !!process.env.KV_REST_API_URL &&
  !!process.env.KV_REST_API_TOKEN &&
  !!process.env.KV_REST_API_READ_ONLY_TOKEN;

const getKv = async () => {
  const mod = await import('@vercel/kv');
  return mod.kv;
};

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

const getClientIp = (req: VercelRequest): string => {
  const xfwd = String(req.headers['x-forwarded-for'] || '').split(',')[0]?.trim();
  const realIp = String(req.headers['x-real-ip'] || '').trim();
  return xfwd || realIp || 'unknown';
};

const rateLimit = async (key: string) => {
  const windowSeconds = 60 * 10;
  const max = Number(process.env.SUPPORT_AI_RL_MAX || 20);
  const kvKey = `rl:support:${key}:${Math.floor(Date.now() / (windowSeconds * 1000))}`;

  if (!hasKV) {
    if (process.env.NODE_ENV === 'production') {
      return { ok: false, remaining: 0, reason: 'KV not configured' as const };
    }
    return { ok: true, remaining: max };
  }

  const kv = await getKv();
  const count = await kv.incr(kvKey);
  if (count === 1) {
    await kv.expire(kvKey, windowSeconds);
  }
  return { ok: count <= max, remaining: Math.max(0, max - count) };
};

const systemPrompt = (path?: string) => `
You are a support assistant for "Perfect Mockup" (a web app).
Goal: help the user use the product with short, concrete, step-by-step instructions.

Rules:
- Respond in English.
- Do not invent features. If info is missing, ask 1 focused question.
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
  const rl = await rateLimit(rlKey);
  if (!rl.ok) {
    res.status(429).json({ error: rl.reason || 'Rate limited', reply: 'Too many requests. Please try again in a few minutes.' });
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
