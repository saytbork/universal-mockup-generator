import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-11-20.acacia' as any, // Cast to any to avoid lint error if types are mismatched
});

const PLAN_PRICES = {
    creator: process.env.STRIPE_PRICE_CREATOR || 'price_creator_placeholder',
    studio: process.env.STRIPE_PRICE_STUDIO || 'price_studio_placeholder',
};

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { plan, email } = req.body;

    if (!plan || !['creator', 'studio'].includes(plan)) {
        return res.status(400).json({ error: 'Invalid plan selected.' });
    }

    const priceId = PLAN_PRICES[plan as keyof typeof PLAN_PRICES];

    if (!priceId) {
        return res.status(500).json({ error: 'Price ID not configured.' });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'payment', // or 'subscription' if recurring
            success_url: `${req.headers.origin}/?success=true&plan=${plan}`,
            cancel_url: `${req.headers.origin}/?canceled=true`,
            customer_email: email,
            metadata: {
                plan,
            },
        });

        return res.status(200).json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Stripe Checkout Error:', error);
        return res.status(500).json({ error: 'Failed to create checkout session.' });
    }
}
