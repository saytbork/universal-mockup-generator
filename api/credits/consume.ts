import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getUser, setUser } from "../_lib/store";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { email } = req.body || {};
  if (!email) {
    res.status(400).json({ error: "Missing email" });
    return;
  }

  try {
    const user = getUser(email);
    if (user.credits <= 0) {
      res.status(400).json({ error: "No credits" });
      return;
    }
    setUser(email, { credits: user.credits - 1 });
    res.json({ ok: true, credits: user.credits - 1 });
  } catch (error) {
    console.error("consume credit error", error);
    res.status(500).json({ error: "Unable to consume credit" });
  }
}
