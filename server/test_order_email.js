require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const order = {
    id: 'ORD-LIVE-999999',
    total: 570,
    paymentMethod: 'cod',
    transactionId: 'COD',
    notes: 'Test from script',
    items: [
        { name: 'Kashmiri Almond - 500g', price: 510, quantity: 1 },
        { name: 'Organic Maize Flour', price: 60, quantity: 1 }
    ],
    customer: {
        name: 'Tilak Mishra',
        phone: '09958776101',
        address: 'Panchari, Tehsil Panchari',
        city: 'Jammu',
        pincode: '182125',
        email: 'tilakmishra.76@gmail.com'
    }
};

const itemsHtml = order.items.map(item => `
    <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} × ${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price * item.quantity}</td>
    </tr>
`).join('');

transporter.sendMail({
    from: `"Nature's Pledge Orders" <${process.env.EMAIL_USER}>`,
    to: 'tilakmishra.76@gmail.com',
    subject: `🛒 NEW ORDER RECEIVED! (#${order.id})`,
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
            <div style="background: #5D4037; color: white; padding: 20px; text-align: center;">
                <h2 style="margin:0;">🛒 New Order Received!</h2>
                <p style="margin:5px 0 0 0; opacity:0.8;">Order #${order.id}</p>
            </div>
            <div style="padding: 20px;">
                <h3 style="color:#5D4037; border-bottom: 1px solid #eee; padding-bottom: 8px;">👤 Customer</h3>
                <p><strong>Name:</strong> ${order.customer.name}<br>
                <strong>Phone:</strong> ${order.customer.phone}<br>
                <strong>Email:</strong> ${order.customer.email}</p>

                <h3 style="color:#5D4037; border-bottom: 1px solid #eee; padding-bottom: 8px;">📍 Delivery Address</h3>
                <p>${order.customer.address}<br>
                ${order.customer.city} - <strong>${order.customer.pincode}</strong></p>

                <h3 style="color:#5D4037; border-bottom: 1px solid #eee; padding-bottom: 8px;">📦 Items</h3>
                <table style="width:100%; border-collapse:collapse;">
                    <thead><tr style="background:#f5ede8;"><th style="padding:8px;text-align:left;">Product</th><th style="padding:8px;text-align:right;">Amount</th></tr></thead>
                    <tbody>${itemsHtml}</tbody>
                    <tfoot><tr><td style="padding:12px;font-weight:bold;border-top:2px solid #eee;">Total</td><td style="padding:12px;font-weight:bold;text-align:right;color:#B12704;border-top:2px solid #eee;">₹${order.total}</td></tr></tfoot>
                </table>

                <p style="margin-top:15px;"><strong>💳 Payment:</strong> Cash on Delivery</p>

                <div style="text-align:center;margin-top:25px;">
                    <a href="http://localhost:5173/admin" style="background:#5D4037;color:white;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">🖥️ Open Admin Dashboard →</a>
                </div>
            </div>
        </div>
    `
}, (err, info) => {
    if (err) {
        console.error('❌ EMAIL FAILED:', err.message);
    } else {
        console.log('✅ EMAIL SENT!', info.response);
    }
});
