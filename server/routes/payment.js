const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const shortid = require('shortid');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: 'rzp_test_YourKeyHere', // Replace with valid Test Key ID for the user to try
    key_secret: 'YourKeySecretHere' // Replace with valid Test Key Secret
});

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
        if (razorpay.key_id === 'rzp_test_YourKeyHere') {
            console.log('Simulating Razorpay Order (Mock Mode)');
            return res.json({
                id: 'order_mock_' + shortid.generate(),
                currency: currency,
                amount: options.amount
            });
        }

        const response = await razorpay.orders.create(options);
        res.json({
            id: response.id,
            currency: response.currency,
            amount: response.amount
        });
    } catch (error) {
        console.log("Razorpay Error:", error);
        // Fallback for demo if API fails
        res.json({
            id: 'order_mock_fallback_' + shortid.generate(),
            currency: currency,
            amount: options.amount
        });
    }
});

// Verify payment signature
router.post('/verify', (req, res) => {
    const secret = 'YourKeySecretHere'; // Must match key_secret above

    // Ideally, you would use webhook signature verification, 
    // but for simple checkout success flow:
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // MOCK VERIFICATION
    if (secret === 'YourKeySecretHere') {
        return res.json({ status: 'success' });
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
