import Stripe from "stripe";
import { db } from "../../_lib/firebaseAdmin";

export const config = { api: { bodyParser: false } };

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const sig = req.headers["stripe-signature"] as string;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch (err) {
    res.status(400).send("Webhook Error");
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_email || '';
    if (email) {
      await db.collection("users").doc(email).set(
        {
          plan: session.subscription,
          credits: 20,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    }
  }

  res.json({ received: true });
}
