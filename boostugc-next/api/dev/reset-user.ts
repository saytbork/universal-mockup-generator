import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { getFirestore } from '../_lib/firebaseAdmin.js';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

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

  const { uid, email } = req.body || {};
  if (!uid || !email) {
    return res.status(400).json({ error: 'Missing uid or email' });
  }
  if (!isAdminEmail(email)) {
    return res.status(403).json({ error: 'Admin only' });
  }

  try {
    const db = getFirestore();
    const userRef = db.collection('users').doc(uid);
    const snap = await userRef.get();
    const data = snap.data() || {};
    const subscriptionId = data.subscriptionId as string | undefined;

    if (stripe && subscriptionId) {
      try {
        await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
      } catch (err) {
        console.error('Stripe cancel failed', err);
      }
    }

    await userRef.set(
      {
        plan: 'free',
        subscriptionStatus: 'inactive',
        credits: 0,
        currentPeriodEnd: null,
        subscriptionId: null,
        updatedAt: Date.now(),
      },
      { merge: true }
    );

    return res.status(200).json({ success: true, reset: true });
  } catch (error) {
    console.error('Reset user failed', error);
    return res.status(500).json({ error: 'Unable to reset user' });
  }
}
