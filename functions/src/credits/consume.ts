import * as functions from "firebase-functions/v2/https";
import { db } from "../firebase/firestore.js";

export const consumeCredit = functions.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: "Missing email" });
  }

  const ref = db.collection("users").doc(email);

  await db.runTransaction(async (t) => {
    const snap = await t.get(ref);
    const credits = (snap.data()?.credits || 0);
    if (credits <= 0) throw new Error("No credits");
    t.update(ref, { credits: credits - 1 });
  });

  return res.json({ ok: true });
});
