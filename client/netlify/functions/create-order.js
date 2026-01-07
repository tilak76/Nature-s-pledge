const Razorpay = require('razorpay');

exports.handler = async (event, context) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { amount, currency = 'INR' } = JSON.parse(event.body);

    // Initialize Razorpay with Environment Variables (User must set these in Netlify)
    // Fallback to Test Keys for demo if not set
    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyHere',
        key_secret: process.env.RAZORPAY_KEY_SECRET || 'YourTestSecretHere',
    });

    const options = {
        amount: amount * 100, // Amount in paise
        currency,
        receipt: `receipt_${Date.now()}`,
        payment_capture: 1,
    };

    try {
        const response = await razorpay.orders.create(options);
        return {
            statusCode: 200,
            body: JSON.stringify(response),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
