import Stripe from "stripe";
import * as functions from "firebase-functions/v2/https";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const createPortal = functions.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { customerId } = req.body || {};
  if (!customerId) {
    return res.status(400).json({ error: "Missing customerId" });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: "https://boostugc.app/dashboard",
  });

  return res.status(200).json({ url: session.url });
});
