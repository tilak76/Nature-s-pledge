require('dotenv').config();
const nodemailer = require('nodemailer');

const getTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

const sendOrderNotification = async (order) => {
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'tilakmishra.76@gmail.com';
    const itemsHtml = (order.items || []).map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} × ${item.quantity || 1}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price * (item.quantity || 1)}</td>
        </tr>
    `).join('');

    const mailOptions = {
        from: `"Nature's Pledge Orders" <${process.env.EMAIL_USER}>`,
        to: ADMIN_EMAIL,
        subject: `🛒 NEW ORDER RECEIVED! (#${order.id})`,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
                <div style="background: #5D4037; color: white; padding: 25px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">New Order Placed!</h1>
                    <p style="margin: 5px 0 0 0; opacity: 0.8;">Order ID: #${order.id}</p>
                </div>
            </div>
        `
    };

    try {
        const info = await getTransporter().sendMail(mailOptions);
        console.log("Order exact email triggered for:", order.id, "INFO:", info.response);
    } catch (err) {
        console.error("Order notification email failed:", err.message);
    }
};

const dummyOrder = { id: 'ORD-509634', items: [{ name: 'Test', price: 100, quantity: 1 }] };
sendOrderNotification(dummyOrder);
