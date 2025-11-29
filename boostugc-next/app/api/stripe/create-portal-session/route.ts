import Stripe from 'stripe';
import { getFirestore } from '../_lib/firebaseAdmin.js';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.APP_URL ? `https://${process.env.APP_URL}` : undefined) ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
  'http://localhost:3000';

const stripe = stripeSecret
  ? new Stripe(stripeSecret)
  : null;

export async function POST(req: Request) {
  if (!stripe) {
    return new Response(JSON.stringify({ error: 'Stripe secret key is not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { uid } = await req.json();
  if (!uid) {
    return new Response(JSON.stringify({ error: 'Missing uid' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = getFirestore();
    const userSnap = await db.collection('users').doc(uid).get();
    const data = userSnap.data();

    const customerId = data?.stripeCustomerId;
    if (!customerId) {
      return new Response(JSON.stringify({ error: 'No Stripe customer found for this user' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/dashboard`,
    });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating portal session', error);
    return new Response(JSON.stringify({ error: 'Unable to create portal session' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
