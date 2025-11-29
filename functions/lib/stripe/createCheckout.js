import Stripe from "stripe";
import * as functions from "firebase-functions/v2/https";
import { db } from "../firebase/firestore.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const createCheckout = functions.onRequest(async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
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
    if (userId) {
        await db.collection("checkout_intents").doc(session.id).set({
            userId,
            priceId,
            createdAt: Date.now(),
        });
    }
    res.status(200).json({ url: session.url });
});
