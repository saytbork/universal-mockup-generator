import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkAuth } from '../../server/lib/checkAuth.js';
import { getEffectiveCredits, isUnlimitedCreditsEmail, listUsers } from '../../server/lib/store.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  if (!isUnlimitedCreditsEmail(email)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const limit = Number(req.query.limit || 200);
  const users = await listUsers(limit);
  const rows = users
    .map(({ email: userEmail, user }) => {
      const plan = String(user.plan || 'free').trim().toLowerCase() || 'free';
      return {
        email: userEmail,
        plan,
        credits: user.credits ?? getEffectiveCredits(user),
        remaining_credits: getEffectiveCredits(user),
        trial_remaining: user.trialRemaining ?? 0,
        invite_remaining: user.inviteRemaining ?? 0,
        subscription_remaining: user.subscriptionRemaining ?? 0,
        created_at: user.createdAt ?? null,
        last_login_at: user.lastLoginAt ?? null,
        updated_at: user.updatedAt ?? null,
      };
    })
    .sort((a, b) => (b.created_at || 0) - (a.created_at || 0));

  const summary = rows.reduce(
    (acc, row) => {
      acc.total += 1;
      if (row.plan === 'free') acc.free += 1;
      else if (row.plan === 'creator') acc.creator += 1;
      else if (row.plan === 'studio') acc.studio += 1;
      else acc.other += 1;
      return acc;
    },
    { total: 0, free: 0, creator: 0, studio: 0, other: 0 }
  );

  res.status(200).json({ summary, users: rows });
}

