import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkAuth } from '../server/lib/checkAuth.js';
import { getUser } from '../server/lib/store.js';

const parseAction = (req: VercelRequest) => {
  const raw = req.query.action;
  if (Array.isArray(raw)) {
    return raw[0]?.toString().toLowerCase() ?? '';
  }
  return typeof raw === 'string' ? raw.toLowerCase() : '';
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = parseAction(req);
  if (action !== 'me') {
    res.status(400).json({ error: 'Invalid action' });
    return;
  }
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const email = checkAuth(req);
  if (!email) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  const user = await getUser(email);
  res.status(200).json({
    email,
    credits: user.credits ?? 0,
    plan: user.plan ?? 'free',
    inviteUsed: user.inviteUsed ?? false,
  });
}
