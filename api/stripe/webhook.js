import Stripe from "stripe";
import { db } from "../../_lib/firebaseAdmin.js";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    res.status(400).send("Webhook Error");
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const email = session.customer_email;

    await db.collection("users").doc(email).set(
      {
        plan: session.subscription,
        credits: 20,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  }

  res.json({ received: true });
}
