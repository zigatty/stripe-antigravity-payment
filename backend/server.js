
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PLAN_PRICE_IDS = {
    pro: process.env.STRIPE_PRO_PRICE_ID,
    business: process.env.STRIPE_BUSINESS_PRICE_ID,
};

app.post('/create-checkout-session', async (req, res) => {
    try {
        const { planId } = req.body;

        if (planId === 'free') {
            return res.status(200).json({ url: null, free: true });
        }

        const priceId = PLAN_PRICE_IDS[planId];

        if (!priceId) {
            return res.status(400).json({ error: `Invalid plan: ${planId}` });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `http://localhost:${process.env.PORT || 5000}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:${process.env.PORT || 5000}/cancel`,
        });

        res.status(200).json({ url: session.url });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/success', (req, res) => {
    res.send("Payment successful!");
});

app.get('/cancel', (req, res) => {
    res.send("Payment cancelled.");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
