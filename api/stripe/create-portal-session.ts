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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!stripe) {
    return res.status(500).json({ error: 'Stripe secret key is not configured' });
  }

  const { uid } = req.body || {};
  if (!uid) {
    return res.status(400).json({ error: 'Missing uid' });
  }

  try {
    const db = getFirestore();
    const userSnap = await db.collection('users').doc(uid).get();
    const data = userSnap.data();

    const customerId = data?.stripeCustomerId;
    if (!customerId) {
      return res.status(400).json({ error: 'No Stripe customer found for this user' });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/dashboard`,
    });

    return res.status(200).json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating portal session', error);
    return res.status(500).json({ error: 'Unable to create portal session' });
  }
}
