import Stripe from "stripe";
import * as functions from "firebase-functions/v2/https";
import { db } from "../firebase/firestore.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const createCheckout = functions.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, priceId } = req.body || {};
  if (!priceId) {
    return res.status(400).json({ error: "Missing priceId" });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: userId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: "https://boostugc.app/dashboard?success=true",
    cancel_url: "https://boostugc.app/pricing?cancel=true",
  });

  if (userId) {
    await db.collection("checkout_intents").doc(session.id).set({
      userId,
      priceId,
      createdAt: Date.now(),
    });
  }

  return res.status(200).json({ url: session.url });
});
