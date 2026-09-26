import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { getStripe } from "../../server/lib/stripeClient.js";
import { setUser, getUser } from "../../server/lib/store.js";
import { addActivity } from "../../server/lib/activity.js";

const hasKV = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
const PLAN_CREDITS: Record<string, number> = { creator: 20, studio: 60 };
const normalizePlan = (value: unknown) => {
  const plan = String(value || '').trim().toLowerCase();
  return plan === 'creator' || plan === 'studio' ? plan : null;
};
const claimStripeEvent = async (eventId: string): Promise<boolean> => {
  if (!hasKV) return true;
  const { kv } = await import("@vercel/kv");
  const result = await kv.set(`stripe:event:${eventId}`, "processing", { nx: true, ex: 60 * 60 * 24 * 30 });
  return result === "OK";
};
const releaseStripeEvent = async (eventId: string | null) => {
  if (!hasKV || !eventId) return;
  const { kv } = await import("@vercel/kv");
  await kv.del(`stripe:event:${eventId}`);
};

export const config = {
  api: {
    bodyParser: false,
  },
};

const buffer = async (req: VercelRequest) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
};

const secrets = [
  process.env.STRIPE_WEBHOOK_SECRET as string | undefined,
  process.env.STRIPE_WEBHOOK_SECRET_TEST as string | undefined,
].filter(Boolean) as string[];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  let claimedEventId: string | null = null;
  if (req.method !== "POST") {
    res.status(405).send("Method not allowed");
    return;
  }

  try {
    const stripe = getStripe();
    const sig = req.headers["stripe-signature"] as string;
    const rawBody = await buffer(req);
    let event: Stripe.Event;

    let constructed: Stripe.Event | null = null;
    for (const secret of secrets) {
      try {
        constructed = stripe.webhooks.constructEvent(rawBody, sig, secret);
        break;
      } catch (err: any) {
        // try next secret
      }
    }
    if (!constructed) {
      console.error("Webhook signature verification failed for all configured secrets.");
      res.status(400).send("Webhook Error");
      return;
    }
    event = constructed;

    if (!(await claimStripeEvent(event.id))) {
      res.status(200).json({ received: true, duplicate: true });
      return;
    }
    claimedEventId = event.id;

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.customer_email || "";
        if (email) {
          const plan = normalizePlan(session.metadata?.plan);
          if (!plan) throw new Error('Checkout session is missing a valid plan');
          const planCredits = PLAN_CREDITS[plan];
          await setUser(email, {
            plan,
            subscriptionRemaining: planCredits,
            trialRemaining: 0,
            inviteRemaining: 0,
          });
          if (session.customer) {
            await stripe.customers.update(session.customer as string, {
              metadata: { ...(session.metadata || {}), subscription_remaining: String(planCredits), plan, email },
            });
          }
          await addActivity(email, "upgrade", { source: "checkout.session.completed" });
        }
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        let email = invoice.customer_email || "";
        if (!email && invoice.customer) {
          const customer = await stripe.customers.retrieve(invoice.customer as string);
          if (!customer.deleted) email = String(customer.email || "");
        }
        if (email) {
          const user = await getUser(email);
          const customer = invoice.customer
            ? await stripe.customers.retrieve(invoice.customer as string)
            : null;
          const customerPlan = customer && !customer.deleted ? normalizePlan(customer.metadata?.plan) : null;
          const plan = normalizePlan(user.plan) || customerPlan;
          if (!plan) break;
          const planCredits = PLAN_CREDITS[plan];
          await setUser(email, { plan, subscriptionRemaining: planCredits });
          if (customer && !customer.deleted) {
            await stripe.customers.update(customer.id, {
              metadata: { ...customer.metadata, subscription_remaining: String(planCredits), plan, email },
            });
          }
          await addActivity(email, "upgrade", { source: "invoice.payment_succeeded", credits: planCredits, plan });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        let email = subscription.metadata?.email || '';
        if (!email && subscription.customer) {
          const customer = await stripe.customers.retrieve(subscription.customer as string);
          if (!customer.deleted) email = String(customer.email || '');
        }
        if (email) {
          await setUser(email, { plan: "free", subscriptionRemaining: 0 });
          await addActivity(email, "upgrade", { source: "customer.subscription.deleted" });
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    await releaseStripeEvent(claimedEventId).catch(() => undefined);
    console.error("Webhook handler error");
    res.status(500).json({ error: "Webhook processing failed" });
  }
}
