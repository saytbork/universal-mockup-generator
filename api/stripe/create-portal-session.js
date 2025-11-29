import Stripe from "stripe";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { customerId } = req.body || {};
  if (!customerId) {
    return res.status(400).json({ error: "Missing customerId" });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: "https://boostugc.app/dashboard",
  });

  res.json({ url: session.url });
}
