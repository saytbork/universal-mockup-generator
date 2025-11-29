import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getStripe } from "../lib/stripeClient";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const stripe = getStripe();
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
  } catch (error: any) {
    console.error("create-portal-session error", error);
    res.status(500).json({ error: "Unable to create portal session" });
  }
}
