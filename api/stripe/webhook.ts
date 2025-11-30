import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { getStripe } from "../../server/lib/stripeClient.js";
import { setUser } from "../../server/lib/store.js";

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
          setUser(email, { plan: session.subscription as string, credits: 20 });
        }
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const email = invoice.customer_email || (invoice.customer as string);
        if (email) {
          setUser(email, { credits: 20 });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const email = subscription.metadata?.email;
        if (email) {
          setUser(email, { plan: "free", credits: 0 });
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
