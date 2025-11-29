import Stripe from "stripe";
import * as functions from "firebase-functions/v2/https";
import { db } from "../firebase/firestore.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const webhook = functions.onRequest(
  { secrets: ["STRIPE_WEBHOOK_SECRET"], maxInstances: 1 },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).send("Method not allowed");
    }

    const sig = req.headers["stripe-signature"] as string;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
    } catch (err) {
      console.error("Webhook signature verification failed", err);
      return res.status(400).send("Webhook Error");
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const email = session.customer_email || "";
          if (email) {
            await db
              .collection("users")
              .doc(email)
              .set(
                {
                  plan: session.subscription,
                  credits: 20,
                  updatedAt: Date.now(),
                },
                { merge: true }
              );
          }
          break;
        }
        case "invoice.payment_succeeded": {
          const invoice = event.data.object as Stripe.Invoice;
          const email = invoice.customer_email || invoice.customer as string;
          if (email) {
            await db
              .collection("users")
              .doc(email)
              .set(
                {
                  credits: 20,
                  updatedAt: Date.now(),
                },
                { merge: true }
              );
          }
          break;
        }
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          const email = subscription.metadata?.email;
          if (email) {
            await db
              .collection("users")
              .doc(email)
              .set(
                {
                  plan: "free",
                  credits: 0,
                  updatedAt: Date.now(),
                },
                { merge: true }
              );
          }
          break;
        }
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
      return res.status(200).json({ received: true });
    } catch (error) {
      console.error("Webhook handler error", error);
      return res.status(500).json({ error: "Webhook processing failed" });
    }
  }
);
