import Stripe from 'stripe';
import { getFirestore } from '../../_lib/firebaseAdmin';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.APP_URL ? `https://${process.env.APP_URL}` : undefined) ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
  'http://localhost:3000';

const stripe = stripeSecret
  ? new Stripe(stripeSecret)
  : null;

const PLAN_PRICE_IDS: Record<string, string | undefined> = {
  'creator-monthly': process.env.STRIPE_PRICE_CREATOR_MONTHLY,
  'creator-annual': process.env.STRIPE_PRICE_CREATOR_ANNUAL || process.env.STRIPE_PRICE_CREATOR_YEARLY,
  'creator-yearly': process.env.STRIPE_PRICE_CREATOR_YEARLY || process.env.STRIPE_PRICE_CREATOR_ANNUAL,
  'studio-monthly': process.env.STRIPE_PRICE_STUDIO_MONTHLY,
  'studio-annual': process.env.STRIPE_PRICE_STUDIO_ANNUAL || process.env.STRIPE_PRICE_STUDIO_YEARLY,
  'studio-yearly': process.env.STRIPE_PRICE_STUDIO_YEARLY || process.env.STRIPE_PRICE_STUDIO_ANNUAL,
};

export async function POST(req: Request) {
  if (!stripe) {
    return new Response(JSON.stringify({ error: 'Stripe secret key is not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { uid, email, plan, priceId: incomingPriceId }: { uid?: string; email?: string; plan?: string; priceId?: string } = await req.json();

  if (!uid || !email) {
    return new Response(JSON.stringify({ error: 'Missing uid or email' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const priceId =
    incomingPriceId ||
    (plan ? PLAN_PRICE_IDS[plan] : undefined);

  if (!priceId) {
    return new Response(JSON.stringify({ error: 'Missing priceId or unsupported plan' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const checkoutPriceId = priceId as string;

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
      line_items: [{ price: checkoutPriceId, quantity: 1 }],
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cancel`,
      metadata: {
        firebase_uid: uid,
        plan,
        priceId,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating checkout session', error);
    return new Response(JSON.stringify({ error: 'Unable to create checkout session' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
