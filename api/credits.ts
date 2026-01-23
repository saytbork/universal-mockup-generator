import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkAuth } from '../server/lib/checkAuth.js';
import { getUser, setUser } from '../server/lib/store.js';
import { addActivity } from '../server/lib/activity.js';

const parseAction = (req: VercelRequest) => {
  const raw = req.query.action;
  if (Array.isArray(raw)) {
    return raw[0]?.toString().toLowerCase() ?? '';
  }
  return typeof raw === 'string' ? raw.toLowerCase() : '';
};

const parseAmount = (raw: unknown) => {
  const num = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(num)) return null;
  const integer = Math.floor(num);
  if (integer <= 0) return null;
  if (integer > 1000) return null;
  return integer;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = parseAction(req);
  if (action !== 'consume' && action !== 'refund') {
    res.status(400).json({ error: 'Invalid action' });
    return;
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const email = checkAuth(req);
  if (!email) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const { amount } = req.body || {};
  const creditAmount = parseAmount(amount) ?? 1;
  try {
    const user = await getUser(email);
    if (action === 'consume') {
      if ((user.credits ?? 0) < creditAmount) {
        res.status(400).json({ error: 'No credits' });
        return;
      }
      const next = (user.credits ?? 0) - creditAmount;
      await setUser(email, { credits: next });
      await addActivity(email, 'image', { delta: -creditAmount });
      res.json({ ok: true, credits: next });
      return;
    }
    const next = (user.credits ?? 0) + creditAmount;
    await setUser(email, { credits: next });
    await addActivity(email, 'image', { delta: creditAmount, refund: true });
    res.json({ ok: true, credits: next });
  } catch (error) {
    console.error('consume credit error', error);
    res.status(500).json({ error: 'Unable to consume credit' });
  }
}
