import * as functions from "firebase-functions/v2/https";
export const sendMagicLink = functions.onRequest(async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    // Client uses Firebase Auth sendSignInLinkToEmail directly; placeholder for compatibility.
    res.status(200).json({ ok: true });
});
