import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore } from '../_lib/firebaseAdmin.js';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || process.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map(email => email.trim().toLowerCase())
  .filter(Boolean);

const isAdminEmail = (email?: string) => {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return (
    normalized === 'boostugc@gmail.com' ||
    normalized === 'juanamisano@gmail.com' ||
    normalized.endsWith('@amisano-design.com') ||
    ADMIN_EMAILS.includes(normalized)
  );
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { uid, cost, amount, test, email } = req.body || {};
  const resolvedUid = uid || email;
  const isTest = Boolean(test);
  const delta = typeof amount === 'number'
    ? amount
    : typeof cost === 'number'
      ? -Math.abs(cost)
      : null;

  if (!resolvedUid || delta === null) {
    return res.status(400).json({ error: 'Missing uid or amount' });
  }

  if (isTest && !isAdminEmail(email)) {
    return res.status(403).json({ error: 'Admin only' });
  }

  try {
    const db = getFirestore();
    const userRef = db.collection('users').doc(resolvedUid);

    await db.runTransaction(async tx => {
      const snap = await tx.get(userRef);
      const data = snap.data() || {};
      const currentCredits = data.credits ?? 0;

      if (!isTest && delta < 0 && currentCredits < Math.abs(delta)) {
        throw new Error('NOT_ENOUGH_CREDITS');
      }

      const nextCredits = currentCredits + delta;

      tx.set(userRef, {
        credits: nextCredits,
        updatedAt: Date.now(),
      }, { merge: true });
    });

    return res.status(200).json({ ok: true, added: delta });
  } catch (error: any) {
    if (error?.message === 'NOT_ENOUGH_CREDITS') {
      return res.status(400).json({ error: 'Not enough credits' });
    }
    console.error('Error consuming credits', error);
    return res.status(500).json({ error: 'Unable to consume credits' });
  }
}
