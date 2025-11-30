import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyMagicToken } from "../../server/lib/magicToken.js";
import { getStripe } from "../../server/lib/stripeClient.js";
import { getUser, setUser } from "../../server/lib/store.js";
import { addActivity } from "../../server/lib/activity.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    res.status(400).send("Invalid or expired token");
    return;
  }

  const parsed = verifyMagicToken(token);
  if (!parsed) {
    res.status(400).send("Invalid or expired token");
    return;
  }

  const email = parsed.email;
  const invitationCode = parsed.invitationCode || null;

  res.setHeader("Set-Cookie", [
    `session_email=${encodeURIComponent(email)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
  ]);

  // Optional bonus handling on verify (one-time, non-disposable domains)
  try {
    const requiredCode = process.env.INVITATION_CODE;
    const disposableDomains = ["mailinator.com", "yopmail.com", "10minutemail", "guerrillamail.com"];
    const domain = email.split("@")[1] || "";
    const isDisposable = disposableDomains.some((d) => domain.toLowerCase().includes(d));

    const shouldApplyBonus =
      invitationCode && requiredCode && invitationCode === requiredCode && !isDisposable;

    if (shouldApplyBonus) {
      const stripe = getStripe();
      // Find or create customer
      const customers = await stripe.customers.list({ email, limit: 1 });
      const existing = customers.data[0];
      const customer =
        existing ||
        (await stripe.customers.create({
          email,
          metadata: {},
        }));

      const metadata = customer.metadata || {};
      const alreadyClaimed = metadata.invite_bonus_claimed === "true";

      if (!alreadyClaimed) {
        // Mark as claimed in Stripe metadata
        await stripe.customers.update(customer.id, {
          metadata: { ...metadata, invite_bonus_claimed: "true" },
        });
        // Grant 20 credits in our store
        const user = await getUser(email);
        await setUser(email, { credits: (user.credits || 0) + 20, inviteUsed: true });
        await addActivity(email, "invite", { bonus: 20 });
      }
    }
  } catch (err) {
    console.error("Invitation bonus error", err);
    // Do not block login on bonus error
  }

  await addActivity(email, "login", {});

  res.writeHead(302, { Location: "/dashboard" });
  res.end();
}
