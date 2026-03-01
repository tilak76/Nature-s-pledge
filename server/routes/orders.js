const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const fs = require('fs');
const path = require('path');
const jsonPath = path.join(__dirname, '../data/orders.json');
const nodemailer = require('nodemailer');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'tilakmishra.76@gmail.com';

let transporterInstance = null;
const getTransporter = () => {
    if (!transporterInstance) {
        transporterInstance = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    return transporterInstance;
};

const sendOrderNotification = async (order) => {
    console.log("DEBUG EMAIL:", process.env.EMAIL_USER, process.env.EMAIL_PASS ? "Pass Present" : "No Pass");
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("Order email not sent. Missing EMAIL_USER or EMAIL_PASS");
        return;
    }

    const itemsHtml = (order.items || []).map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} × ${item.quantity || 1}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price * (item.quantity || 1)}</td>
        </tr>
    `).join('');

    const mailOptions = {
        from: `"Nature's Pledge Orders" <${process.env.EMAIL_USER}>`,
        to: ADMIN_EMAIL,
        subject: `🛒 NEW ORDER #${order.id} — ₹${order.total || order.totalAmount} (${order.paymentMethod === 'razorpay' ? 'PAID' : 'COD'}) — ${order.customer?.name || order.shipping?.fullName || 'Customer'}`,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
                <div style="background: #5D4037; color: white; padding: 25px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">🛒 New Order Received!</h1>
                    <p style="margin: 6px 0 0 0; opacity: 0.85; font-size: 1rem;">Order ID: <strong>#${order.id}</strong></p>
                    <p style="margin: 3px 0 0 0; opacity: 0.7; font-size: 0.82rem;">${new Date(order.date || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                </div>

                <div style="padding: 25px; background: #fff;">

                    <h3 style="color: #5D4037; border-bottom: 2px solid #e8d5cc; padding-bottom: 8px; margin-top: 0;">👤 Customer Details</h3>
                    <table style="width:100%; border-collapse: collapse; margin-bottom: 20px;">
                        <tr><td style="padding: 6px 0; color: #888; width: 120px;">Name</td><td style="padding: 6px 0; font-weight: 600;">${order.customer?.name || order.shipping?.fullName || 'N/A'}</td></tr>
                        <tr><td style="padding: 6px 0; color: #888;">Phone</td><td style="padding: 6px 0; font-weight: 600;">${order.customer?.phone || order.shipping?.phone || 'N/A'}</td></tr>
                        <tr><td style="padding: 6px 0; color: #888;">Email</td><td style="padding: 6px 0;">${order.customer?.email || 'Guest'}</td></tr>
                    </table>

                    <h3 style="color: #5D4037; border-bottom: 2px solid #e8d5cc; padding-bottom: 8px;">📍 Delivery Address</h3>
                    <div style="background: #fdfaf7; border: 1px solid #e8d5cc; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; line-height: 1.9; font-size: 0.96rem;">
                        ${order.customer?.address || order.shipping?.address || 'N/A'}<br>
                        ${order.customer?.city || order.shipping?.city || ''} - <strong>${order.customer?.pincode || order.shipping?.pincode || ''}</strong><br>
                        📞 ${order.customer?.phone || order.shipping?.phone || 'N/A'}
                        ${order.notes ? '<br><em style="color:#888;">📝 Note: ' + order.notes + '</em>' : ''}
                    </div>

                    <h3 style="color: #5D4037; border-bottom: 2px solid #e8d5cc; padding-bottom: 8px;">📦 Items Ordered</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.95rem;">
                        <thead>
                            <tr style="background: #f5ede8;">
                                <th style="padding: 10px; text-align: left; color: #5D4037; font-weight: 600;">Product</th>
                                <th style="padding: 10px; text-align: right; color: #5D4037; font-weight: 600;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>${itemsHtml}</tbody>
                        <tfoot>
                            <tr style="background: #fff8f5;">
                                <td style="padding: 14px 10px; font-weight: bold; font-size: 1.05rem; border-top: 2px solid #e8d5cc;">Total</td>
                                <td style="padding: 14px 10px; font-weight: bold; font-size: 1.2rem; text-align: right; color: #B12704; border-top: 2px solid #e8d5cc;">₹${order.total || order.totalAmount || 0}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div style="background: #fdfaf7; padding: 14px 18px; border-radius: 8px; margin-top: 18px; border: 1px solid #f0e6e0; font-size: 0.9rem;">
                        <p style="margin: 0;"><strong>💳 Payment:</strong> ${order.paymentMethod === 'razorpay' ? '✅ Paid Online (Razorpay)' : order.paymentMethod === 'wallet' ? '✅ Paid via Wallet' : '🚚 Cash on Delivery (COD)'}</p>
                        ${order.transactionId && order.transactionId !== 'COD' ? '<p style="margin: 5px 0 0 0;"><strong>Txn ID:</strong> ' + order.transactionId + '</p>' : ''}
                    </div>

                    <div style="text-align: center; margin-top: 28px;">
                        <a href="http://10.240.184.95:5173/admin" style="background: #5D4037; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 1rem; display: inline-block;">🖥️ Open Admin Dashboard &rarr;</a>
                        <p style="margin: 8px 0 0 0; font-size: 0.78rem; color: #bbb;">Update order status & process shipping here</p>
                    </div>
                </div>

                <div style="background: #f5f5f5; color: #999; padding: 14px; text-align: center; font-size: 11px;">
                    &copy; ${new Date().getFullYear()} Nature's Pledge &mdash; Admin Order Alert
                </div>
            </div>
        `
    };

    try {
        await getTransporter().sendMail(mailOptions);
        console.log("✅ Admin order email sent for:", order.id);
    } catch (err) {
        console.error("Order notification email failed:", err.message);
    }
};

// Helper for JSON fallback
const getJsonOrders = () => {
    try {
        if (!fs.existsSync(jsonPath)) return [];
        return JSON.parse(fs.readFileSync(jsonPath));
    } catch { return []; }
};

const saveJsonOrder = (order) => {
    try {
        const orders = getJsonOrders();
        orders.unshift(order);
        fs.writeFileSync(jsonPath, JSON.stringify(orders, null, 2));
    } catch (e) { console.error("JSON Save Error", e); }
};

// GET all orders (for Admin)
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        if (orders.length === 0) return res.json(getJsonOrders());
        res.json(orders);
    } catch (err) {
        console.error("DB Error, falling back to JSON");
        res.json(getJsonOrders());
    }
});

const sendCustomerOrderNotification = async (order) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
    const customerEmail = order.customer?.email || order.shipping?.email;
    if (!customerEmail || customerEmail === 'Guest') return;

    const customerName = order.customer?.name || order.shipping?.fullName || 'Customer';
    const address = order.customer?.address || order.shipping?.address || '';
    const city = order.customer?.city || order.shipping?.city || '';
    const pincode = order.customer?.pincode || order.shipping?.pincode || '';
    const phone = order.customer?.phone || order.shipping?.phone || '';

    const itemsHtml = (order.items || []).map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} × ${item.quantity || 1}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price * (item.quantity || 1)}</td>
        </tr>
    `).join('');

    // Estimated delivery: 5-7 business days from order date
    const orderDate = new Date(order.date || Date.now());
    const deliveryFrom = new Date(orderDate); deliveryFrom.setDate(deliveryFrom.getDate() + 5);
    const deliveryTo = new Date(orderDate); deliveryTo.setDate(deliveryTo.getDate() + 7);
    const deliveryStr = `${deliveryFrom.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} – ${deliveryTo.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`;

    const mailOptions = {
        from: `"Nature's Pledge" <${process.env.EMAIL_USER}>`,
        to: customerEmail,
        subject: `✅ Order Confirmed! Nature's Pledge (#${order.id})`,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
                
                <!-- Header -->
                <div style="background: #5D4037; color: white; padding: 28px 25px; text-align: center;">
                    <div style="font-size: 2.2rem; margin-bottom: 8px;">🌿</div>
                    <h1 style="margin: 0; font-size: 22px;">Thank you for your order!</h1>
                    <p style="margin: 6px 0 0 0; opacity: 0.85;">Order ID: <strong>#${order.id}</strong></p>
                    <p style="margin: 3px 0 0 0; opacity: 0.65; font-size: 0.8rem;">Placed on ${new Date(order.date || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>

                <!-- Delivery Banner -->
                <div style="background: #e8f5e9; padding: 14px 25px; text-align: center; border-bottom: 1px solid #c8e6c9;">
                    <p style="margin: 0; font-size: 0.95rem; color: #2e7d32;">🚚 <strong>Estimated Delivery:</strong> ${deliveryStr}</p>
                </div>

                <div style="padding: 25px; background: #fff;">
                    <p style="font-size: 1rem; margin: 0 0 8px 0;">Hi <strong>${customerName}</strong>,</p>
                    <p style="line-height: 1.6; color: #555; margin: 0 0 20px 0;">We've received your order and are carefully preparing it for dispatch. You will get another update once it's shipped. 🙏</p>

                    <!-- Delivery Address -->
                    <h3 style="color: #5D4037; border-bottom: 2px solid #e8d5cc; padding-bottom: 8px; margin-top: 0;">📍 Delivery Address</h3>
                    <div style="background: #fdfaf7; border: 1px solid #e8d5cc; border-radius: 8px; padding: 14px 18px; margin-bottom: 22px; line-height: 1.9; font-size: 0.94rem;">
                        ${address}<br>
                        ${city} - <strong>${pincode}</strong><br>
                        📞 ${phone}
                    </div>

                    <!-- Items -->
                    <h3 style="color: #5D4037; border-bottom: 2px solid #e8d5cc; padding-bottom: 8px;">📦 Your Items</h3>
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.93rem; margin-bottom: 5px;">
                        <thead>
                            <tr style="background: #f5ede8;">
                                <th style="padding: 10px 12px; text-align: left; color: #5D4037; font-weight: 600;">Product</th>
                                <th style="padding: 10px 12px; text-align: right; color: #5D4037; font-weight: 600;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>${itemsHtml}</tbody>
                        <tfoot>
                            <tr style="background: #fff8f5;">
                                <td style="padding: 13px 12px; font-weight: bold; border-top: 2px solid #e8d5cc; font-size: 1rem;">Order Total</td>
                                <td style="padding: 13px 12px; font-weight: bold; text-align: right; color: #B12704; font-size: 1.15rem; border-top: 2px solid #e8d5cc;">₹${order.total || order.totalAmount || 0}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <!-- Payment -->
                    <div style="background: #fdfaf7; padding: 11px 16px; border-radius: 8px; margin-top: 14px; border: 1px solid #f0e6e0; font-size: 0.88rem;">
                        <strong>💳 Payment:</strong> ${order.paymentMethod === 'razorpay' ? '✅ Paid Online (Razorpay)' : order.paymentMethod === 'wallet' ? '✅ Paid via Wallet' : '🚚 Cash on Delivery (COD)'}
                    </div>

                    <!-- Track Order Button -->
                    <div style="text-align: center; margin-top: 28px;">
                        <a href="http://10.240.184.95:5173/track-order?id=${order.id}" style="background: #5D4037; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 1rem; display: inline-block; letter-spacing: 0.2px;">📦 Track Your Order →</a>
                        <p style="margin: 8px 0 0 0; font-size: 0.78rem; color: #bbb;">Click to see live order status</p>
                    </div>

                    <!-- Helpline -->
                    <div style="margin-top: 28px; background: #f9f9f9; border: 1px solid #eee; border-radius: 8px; padding: 16px 18px;">
                        <p style="margin: 0 0 6px 0; font-weight: 600; color: #5D4037; font-size: 0.95rem;">🎧 Need Help?</p>
                        <p style="margin: 0; font-size: 0.88rem; color: #555; line-height: 1.8;">
                            📞 Call / WhatsApp: <a href="tel:+919958776101" style="color: #5D4037; font-weight: 600; text-decoration: none;">+91 99587 76101</a><br>
                            📧 Email: <a href="mailto:tilakmishra.76@gmail.com" style="color: #5D4037; text-decoration: none;">tilakmishra.76@gmail.com</a><br>
                            <span style="color: #aaa; font-size: 0.82rem;">We typically respond within a few hours.</span>
                        </p>
                    </div>
                </div>

                <!-- Footer -->
                <div style="background: #fdfaf7; color: #aaa; padding: 15px; text-align: center; font-size: 11px; border-top: 1px solid #eee;">
                    © ${new Date().getFullYear()} Nature's Pledge — Pure Kashmiri Organics<br>
                    Jagdamby Gen. Store, Tehsil Panchari, District Udhampur, Jammu & Kashmir — 182125
                </div>
            </div>
        `
    };

    try {
        await getTransporter().sendMail(mailOptions);
        console.log("✅ Customer order email sent to:", customerEmail, "for order:", order.id);
    } catch (err) {
        console.error("Customer email failed:", err.message);
    }
};


// POST new order
router.post('/', async (req, res) => {
    const orderData = req.body;
    const newOrderData = {
        ...orderData,
        date: orderData.date || new Date().toISOString(),
        status: orderData.status || 'Pending'
    };

    // Always save to JSON as backup
    saveJsonOrder(newOrderData);

    // Send email notifications
    sendOrderNotification(newOrderData).catch(e => console.error("Admin Notify Error:", e));
    sendCustomerOrderNotification(newOrderData).catch(e => console.error("Customer Notify Error:", e));


    try {
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState === 1) {
            const newOrder = new Order(newOrderData);
            await newOrder.save();
            res.status(201).json(newOrder);
        } else {
            console.warn("MongoDB Unavailable. Skipped save, used JSON backup.");
            res.status(201).json(newOrderData);
        }
    } catch (err) {
        console.warn("MongoDB Save Failed, using JSON only:", err.message);
        res.status(201).json(newOrderData); // Still return 201 as we saved to JSON
    }
});

// UPDATE order status
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const order = await Order.findOneAndUpdate(
            { id: id },
            { status: status },
            { new: true }
        );

        // Sync with JSON too
        const jsonOrders = getJsonOrders();
        const idx = jsonOrders.findIndex(o => String(o.id) === String(id));
        if (idx !== -1) {
            jsonOrders[idx].status = status;
            fs.writeFileSync(jsonPath, JSON.stringify(jsonOrders, null, 2));
        }

        if (!order) return res.json({ id, status, message: 'Updated in JSON cache' });
        res.json(order);
    } catch (err) {
        // Fallback update in JSON
        const jsonOrders = getJsonOrders();
        const idx = jsonOrders.findIndex(o => String(o.id) === String(id));
        if (idx !== -1) {
            jsonOrders[idx].status = status;
            fs.writeFileSync(jsonPath, JSON.stringify(jsonOrders, null, 2));
            return res.json(jsonOrders[idx]);
        }
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
