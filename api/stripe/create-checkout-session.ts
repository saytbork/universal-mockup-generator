import Stripe from "stripe";
import { db } from "../../_lib/firebaseAdmin";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, priceId } = req.body || {};
  if (!priceId) {
    return res.status(400).json({ error: "Missing priceId" });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

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

  res.json({ url: session.url });
}
