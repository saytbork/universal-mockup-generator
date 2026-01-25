import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { getStripe } from "../../server/lib/stripeClient.js";
import { setUser, getUser } from "../../server/lib/store.js";
import { addActivity } from "../../server/lib/activity.js";

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

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.customer_email || "";
        if (email) {
          const plan = (session.metadata?.plan || 'basic').toString().toLowerCase();
          await setUser(email, {
            plan,
            subscriptionRemaining: 20,
            trialRemaining: 0,
            inviteRemaining: 0,
          });
          if (session.customer) {
            await stripe.customers.update(session.customer as string, {
              metadata: { ...(session.metadata || {}), subscription_remaining: "20", plan },
            });
          }
          await addActivity(email, "upgrade", { source: "checkout.session.completed" });
        }
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const email = invoice.customer_email || (invoice.customer as string);
        if (email) {
          const user = await getUser(email);
          const nextCredits = (user.subscriptionRemaining || 0) + 20;
          await setUser(email, { subscriptionRemaining: nextCredits });
          if (invoice.customer) {
            await stripe.customers.update(invoice.customer as string, {
              metadata: { ...(invoice.metadata || {}), subscription_remaining: String(nextCredits) },
            });
          }
          await addActivity(email, "upgrade", { source: "invoice.payment_succeeded", credits: nextCredits });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const email = subscription.metadata?.email;
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
    console.error("Webhook handler error", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}
