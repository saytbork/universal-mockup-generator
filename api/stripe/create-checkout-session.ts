import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getStripe } from "../../server/lib/stripeClient.js";
import { checkAuth } from "../../server/lib/checkAuth.js";

const PRICE_BY_PLAN: Record<string, string | undefined> = {
  creator: process.env.STRIPE_PRICE_CREATOR,
  studio: process.env.STRIPE_PRICE_STUDIO,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const email = checkAuth(req);
  if (!email) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const stripe = getStripe();
    const plan = String(req.body?.plan || "").trim().toLowerCase();
    const priceId = PRICE_BY_PLAN[plan];
    if (!priceId) {
      res.status(400).json({ error: "Invalid subscription plan" });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { plan, email },
      success_url: "https://perfectmockup.com/dashboard?success=true",
      cancel_url: "https://perfectmockup.com/pricing?cancel=true",
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("create-checkout-session error");
    res.status(500).json({ error: "Unable to create checkout session" });
  }
}
