import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getStripe } from "../../server/lib/stripeClient.js";
import { checkAuth } from "../../server/lib/checkAuth.js";

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
    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer = customers.data[0];
    if (!customer) {
      res.status(404).json({ error: "Billing account not found" });
      return;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: "https://perfectmockup.com/dashboard",
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("create-portal-session error");
    res.status(500).json({ error: "Unable to create portal session" });
  }
}
