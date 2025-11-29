import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getStripe } from "../../api/_lib/stripeClient";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const stripe = getStripe();
    const { userId, priceId } = req.body || {};
    if (!priceId) {
      res.status(400).json({ error: "Missing priceId" });
      return;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: userId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: "https://boostugc.app/dashboard?success=true",
      cancel_url: "https://boostugc.app/pricing?cancel=true",
    });

    res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error("create-checkout-session error", error);
    res.status(500).json({ error: "Unable to create checkout session" });
  }
}
