import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkAuth } from '../server/lib/checkAuth.js';
import { getUser, consumeCredit, refundCredit, getEffectiveCredits } from '../server/lib/store.js';
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
  const { amount, bucket } = req.body || {};
  const creditAmount = parseAmount(amount) ?? 1;
  try {
    if (action === 'consume') {
      let consumed = 0;
      let lastBucket: string | undefined;
      for (let i = 0; i < creditAmount; i += 1) {
        const result = await consumeCredit(email);
        if (!result.ok) {
          // Refund any partial consumption
          if (consumed > 0 && lastBucket) {
            for (let j = 0; j < consumed; j += 1) {
              await refundCredit(email, lastBucket as any);
            }
          }
          res.status(402).json({ error: 'No credits' });
          return;
        }
        consumed += 1;
        lastBucket = result.bucket;
      }
      const user = await getUser(email);
      await addActivity(email, 'image', { delta: -creditAmount });
      res.json({
        ok: true,
        credits: user.credits ?? getEffectiveCredits(user),
        remaining_credits: getEffectiveCredits(user),
        trial_remaining: user.trialRemaining ?? 0,
        invite_remaining: user.inviteRemaining ?? 0,
        subscription_remaining: user.subscriptionRemaining ?? 0,
      });
      return;
    }
    // refund
    const targetBucket =
      bucket === 'trial' || bucket === 'invite' || bucket === 'subscription' ? bucket : 'subscription';
    for (let i = 0; i < creditAmount; i += 1) {
      await refundCredit(email, targetBucket);
    }
    const user = await getUser(email);
    await addActivity(email, 'image', { delta: creditAmount, refund: true });
    res.json({
      ok: true,
      credits: user.credits ?? getEffectiveCredits(user),
      remaining_credits: getEffectiveCredits(user),
      trial_remaining: user.trialRemaining ?? 0,
      invite_remaining: user.inviteRemaining ?? 0,
      subscription_remaining: user.subscriptionRemaining ?? 0,
    });
  } catch (error) {
    console.error('consume credit error', error);
    res.status(500).json({ error: 'Unable to consume credit' });
  }
}
