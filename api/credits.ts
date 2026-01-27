import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkAuth } from '../server/lib/checkAuth.js';
import { getUser, consumeCredit, refundCredit, getEffectiveCredits, setUser } from '../server/lib/store.js';
import { addActivity, listActivity } from '../server/lib/activity.js';

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
  if (action !== 'consume' && action !== 'refund' && action !== 'redeem') {
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
  const { amount, bucket, code } = req.body || {};
  const creditAmount = parseAmount(amount) ?? 1;
  try {
    if (action === 'redeem') {
      const normalized = typeof code === 'string' ? code.trim() : '';
      if (!normalized) {
        res.status(400).json({ error: 'Missing code' });
        return;
      }
      const requiredCode = process.env.INVITATION_CODE;
      const testerCode = process.env.TESTER_UPGRADE_CODE || '713371';
      const matchesRequired = requiredCode ? normalized === requiredCode : true;
      const matchesTester = normalized === testerCode;
      if (!matchesRequired && !matchesTester) {
        res.status(400).json({ error: 'Invalid code' });
        return;
      }
      const user = await getUser(email);
      const plan = String(user.plan ?? 'free').trim().toLowerCase();
      if (plan !== 'free') {
        res.status(400).json({ error: 'Code can only be applied to free plan' });
        return;
      }
      if (user.inviteUsed) {
        res.status(409).json({ error: 'Code already used' });
        return;
      }
      let trialRemaining = user.trialRemaining ?? 0;
      if (trialRemaining <= 0) {
        try {
          const recent = await listActivity(email, 30);
          const hasSpend = recent.some(item => item.type === 'image' && Number(item.meta?.delta ?? 0) < 0);
          if (!hasSpend) {
            trialRemaining = 2;
          }
        } catch (err) {
          console.warn('Redeem code activity check failed', err);
        }
      }
      const next = await setUser(email, {
        trialRemaining,
        inviteRemaining: (user.inviteRemaining || 0) + 10,
        inviteUsed: true,
      });
      await addActivity(email, 'invite', { bonus: 10, code: normalized });
      res.json({
        ok: true,
        credits: next.credits ?? getEffectiveCredits(next),
        remaining_credits: getEffectiveCredits(next),
        trial_remaining: next.trialRemaining ?? 0,
        invite_remaining: next.inviteRemaining ?? 0,
        subscription_remaining: next.subscriptionRemaining ?? 0,
        inviteUsed: next.inviteUsed ?? false,
      });
      return;
    }
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
