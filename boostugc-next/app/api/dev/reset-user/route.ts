import Stripe from 'stripe';
import { getFirestore } from '../_lib/firebaseAdmin';

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

export async function POST(req: Request) {
  const { uid, email } = await req.json();
  if (!uid || !email) {
    return new Response(JSON.stringify({ error: 'Missing uid or email' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (!isAdminEmail(email)) {
    return new Response(JSON.stringify({ error: 'Admin only' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
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

    return new Response(JSON.stringify({ success: true, reset: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Reset user failed', error);
    return new Response(JSON.stringify({ error: 'Unable to reset user' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
