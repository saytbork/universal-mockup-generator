import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { getFirestore } from '../_lib/firebaseAdmin.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = stripeSecret
  ? new Stripe(stripeSecret)
  : null;

type PlanId =
  | 'creator-monthly'
  | 'creator-annual'
  | 'creator-yearly'
  | 'studio-monthly'
  | 'studio-annual'
  | 'studio-yearly';

const PRICE_PLAN_LOOKUP: Record<string, { plan: PlanId; credits: number }> = {
  [process.env.STRIPE_PRICE_CREATOR_MONTHLY || '']: { plan: 'creator-monthly', credits: 20 },
  [process.env.STRIPE_PRICE_CREATOR_ANNUAL || process.env.STRIPE_PRICE_CREATOR_YEARLY || '']: {
    plan: 'creator-annual',
    credits: 250,
  },
  [process.env.STRIPE_PRICE_CREATOR_YEARLY || process.env.STRIPE_PRICE_CREATOR_ANNUAL || '']: {
    plan: 'creator-yearly',
    credits: 250,
  },
  [process.env.STRIPE_PRICE_STUDIO_MONTHLY || '']: { plan: 'studio-monthly', credits: 60 },
  [process.env.STRIPE_PRICE_STUDIO_ANNUAL || process.env.STRIPE_PRICE_STUDIO_YEARLY || '']: {
    plan: 'studio-annual',
    credits: 720,
  },
  [process.env.STRIPE_PRICE_STUDIO_YEARLY || process.env.STRIPE_PRICE_STUDIO_ANNUAL || '']: {
    plan: 'studio-yearly',
    credits: 720,
  },
};

const getRawBody = (req: VercelRequest) =>
  new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', chunk => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });

const mapPriceToPlan = (priceId?: string) => {
  if (!priceId) return null;
  const match = PRICE_PLAN_LOOKUP[priceId];
  if (match?.plan) return match;
  return null;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!stripe || !webhookSecret) {
    return res.status(500).json({ error: 'Stripe webhook not configured' });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(rawBody, signature as string, webhookSecret);
  } catch (error: any) {
    console.error('Webhook signature verification failed', error?.message || error);
    return res.status(400).send(`Webhook Error: ${error?.message}`);
  }

  try {
    const db = getFirestore();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = (session.metadata as any)?.firebase_uid;
        const priceId = (session.metadata as any)?.priceId || session?.subscription;
        if (!uid) break;
        const planInfo = mapPriceToPlan(priceId as string);
        await db.collection('users').doc(uid).set(
          {
            stripeCustomerId: session.customer as string,
            subscriptionId: session.subscription as string,
            plan: planInfo?.plan ?? (session.metadata as any)?.plan ?? 'creator-monthly',
            subscriptionStatus: 'active',
            credits: planInfo?.credits ?? 0,
            currentPeriodEnd: session.expires_at ? session.expires_at * 1000 : null,
            updatedAt: Date.now(),
          },
          { merge: true }
        );
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const uid = (subscription.metadata as any)?.firebase_uid;
        const priceId = subscription.items.data[0]?.price?.id;
        const planInfo = mapPriceToPlan(priceId || '');
        if (!uid) break;
        await db.collection('users').doc(uid).set(
          {
            stripeCustomerId: subscription.customer as string,
            subscriptionId: subscription.id,
            plan: planInfo?.plan ?? 'creator-monthly',
            subscriptionStatus: (subscription as any).status,
            credits: planInfo?.credits ?? 0,
            currentPeriodEnd: (subscription as any).current_period_end ? (subscription as any).current_period_end * 1000 : null,
            updatedAt: Date.now(),
          },
          { merge: true }
        );
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const firstLine: any = invoice.lines.data[0] as any;
        const priceId = firstLine?.price?.id;
        const uid = (invoice.metadata as any)?.firebase_uid;
        const planInfo = mapPriceToPlan(priceId || '');
        if (!uid || !planInfo) break;
        await db
          .collection('users')
          .doc(uid)
          .set(
            {
              credits: planInfo.credits,
              plan: planInfo.plan,
              subscriptionStatus: 'active',
              currentPeriodEnd: (invoice as any).period_end ? (invoice as any).period_end * 1000 : null,
              updatedAt: Date.now(),
            },
            { merge: true }
          );
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const uid = (subscription.metadata as any)?.firebase_uid;
        if (!uid) break;
        await db.collection('users').doc(uid).set(
          {
            subscriptionStatus: 'canceled',
            plan: 'free',
            credits: 2,
            currentPeriodEnd: null,
            updatedAt: Date.now(),
          },
          { merge: true }
        );
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook handler error', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}
