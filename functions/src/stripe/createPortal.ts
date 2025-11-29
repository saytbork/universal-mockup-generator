import Stripe from "stripe";
import * as functions from "firebase-functions/v2/https";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const createPortal = functions.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { customerId } = req.body || {};
  if (!customerId) {
    res.status(400).json({ error: "Missing customerId" });
    return;
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: "https://boostugc.app/dashboard",
  });

  res.status(200).json({ url: session.url });
});
