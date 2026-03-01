const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const shortid = require('shortid');
const crypto = require('crypto');

// Razorpay initialization wrapped to prevent crash if keys are missing
let razorpay;
try {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
    } else {
        console.warn('RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing in .env');
        razorpay = { orders: { create: () => { throw new Error('Razorpay keys missing'); } } };
    }
} catch (e) {
    console.error('Razorpay Init Error:', e.message);
    razorpay = { orders: { create: () => { throw new Error('Razorpay init failed'); } } };
}

// Create an order
router.post('/orders', async (req, res) => {
    const { amount, currency } = req.body;
    const options = {
        amount: amount * 100, // amount in smallest currency unit (paise)
        currency,
        receipt: shortid.generate(),
    };

    try {
        // MOCK MODE: If keys are default/missing, return a dummy order
        if (!process.env.RAZORPAY_KEY_ID) {
            console.error('RAZORPAY_KEY_ID is missing!');
            return res.status(500).json({ status: 'error', message: 'Razorpay key missing' });
        }

        const response = await razorpay.orders.create(options);
        res.json({
            id: response.id,
            currency: response.currency,
            amount: response.amount
        });
    } catch (error) {
        console.error("Razorpay Order Creation Error:", error);
        res.status(500).json({ status: 'error', message: error.message || 'Razorpay order failed' });
    }
});

// Verify payment signature
router.post('/verify', (req, res) => {
    const secret = process.env.RAZORPAY_KEY_SECRET; // Must match key_secret above

    // Ideally, you would use webhook signature verification, 
    // but for simple checkout success flow:
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // MOCK VERIFICATION
    if (!secret) {
        console.error("RAZORPAY_KEY_SECRET is missing!");
        return res.status(500).json({ status: 'error', message: 'Secret key missing' });
    }

    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest === razorpay_signature) {
        res.json({ status: 'success' });
    } else {
        res.status(400).json({ status: 'failure' });
    }
});

module.exports = router;
