import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkAuth } from '../server/lib/checkAuth.js';
import { getUser, setUser } from '../server/lib/store.js';
import { listActivity } from '../server/lib/activity.js';

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
    res.status(200).json({
      userId: 'guest',
      email: null,
      plan: 'free',
    });
    return;
  }

  let user = await getUser(email);
  // Migration: older accounts created before server-side credit enforcement may have 0 credits.
  // If they have no prior image consumption activity, grant the Free plan's included 2 credits once.
  const normalizedPlan = String(user.plan ?? 'free').trim().toLowerCase();
  if ((user.credits ?? 0) === 0 && (normalizedPlan === 'free' || normalizedPlan === '' || user.plan == null)) {
    try {
      const recent = await listActivity(email, 30);
      const hasSpend = recent.some(item => item.type === 'image' && Number(item.meta?.delta ?? 0) < 0);
      if (!hasSpend) {
        user = await setUser(email, { credits: 2, plan: user.plan ?? 'free' });
      }
    } catch (err) {
      // Never fail /me due to activity lookups.
      console.warn('Credits migration check failed', err);
    }
  }

  res.status(200).json({
    userId: email,
    email,
    credits: user.credits ?? 0,
    plan: user.plan ?? 'free',
    inviteUsed: user.inviteUsed ?? false,
  });
}
