import * as functions from "firebase-functions/v2/https";

export const sendMagicLink = functions.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  // Client uses Firebase Auth sendSignInLinkToEmail directly; placeholder for compatibility.
  return res.status(200).json({ ok: true });
});
