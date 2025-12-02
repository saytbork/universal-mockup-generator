import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUser, setUser } from '../server/lib/store.js';
import { addActivity } from '../server/lib/activity.js';

const parseAction = (req: VercelRequest) => {
  const raw = req.query.action;
  if (Array.isArray(raw)) {
    return raw[0]?.toString().toLowerCase() ?? '';
  }
  return typeof raw === 'string' ? raw.toLowerCase() : '';
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = parseAction(req);
  if (action !== 'consume') {
    res.status(400).json({ error: 'Invalid action' });
    return;
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { email } = req.body || {};
  if (!email) {
    res.status(400).json({ error: 'Missing email' });
    return;
  }
  try {
    const user = await getUser(email);
    if (user.credits <= 0) {
      res.status(400).json({ error: 'No credits' });
      return;
    }
    await setUser(email, { credits: user.credits - 1 });
    await addActivity(email, 'image', { delta: -1 });
    res.json({ ok: true, credits: user.credits - 1 });
  } catch (error) {
    console.error('consume credit error', error);
    res.status(500).json({ error: 'Unable to consume credit' });
  }
}
