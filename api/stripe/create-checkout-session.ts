import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { getFirestore } from '../_lib/firebaseAdmin.js';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.APP_URL ||
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173';

const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: '2023-10-16' })
  : null;

const PLAN_PRICE_IDS: Record<string, string | undefined> = {
  'creator-monthly': process.env.STRIPE_PRICE_CREATOR_MONTHLY,
  'creator-annual': process.env.STRIPE_PRICE_CREATOR_ANNUAL || process.env.STRIPE_PRICE_CREATOR_YEARLY,
  'creator-yearly': process.env.STRIPE_PRICE_CREATOR_YEARLY || process.env.STRIPE_PRICE_CREATOR_ANNUAL,
  'studio-monthly': process.env.STRIPE_PRICE_STUDIO_MONTHLY,
  'studio-annual': process.env.STRIPE_PRICE_STUDIO_ANNUAL || process.env.STRIPE_PRICE_STUDIO_YEARLY,
  'studio-yearly': process.env.STRIPE_PRICE_STUDIO_YEARLY || process.env.STRIPE_PRICE_STUDIO_ANNUAL,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!stripe) {
    return res.status(500).json({ error: 'Stripe secret key is not configured' });
  }

  const { uid, email, plan, priceId: incomingPriceId }: { uid?: string; email?: string; plan?: string; priceId?: string } = req.body || {};

  if (!uid || !email) {
    return res.status(400).json({ error: 'Missing uid or email' });
  }

  const priceId =
    incomingPriceId ||
    (plan ? PLAN_PRICE_IDS[plan] : undefined);

  if (!priceId) {
    return res.status(400).json({ error: 'Missing priceId or unsupported plan' });
  }

  try {
    const db = getFirestore();
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();
    const userData = userSnap.data() || {};

    let customerId = userData.stripeCustomerId as string | undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { firebase_uid: uid },
      });
      customerId = customer.id;
      await userRef.set(
        {
          email,
          stripeCustomerId: customerId,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cancel`,
      metadata: {
        firebase_uid: uid,
        plan,
        priceId,
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session', error);
    return res.status(500).json({ error: 'Unable to create checkout session' });
  }
}
