const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'tilakmishra.76@gmail.com';
const BASE_URL = 'https://naturespledge.in';

let transporterInstance = null;
const getTransporter = () => {
    if (!transporterInstance && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
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

// Email helper functions (Admin + Customer)
const sendEmails = async (order) => {
    const transporter = getTransporter();
    if (!transporter) return;

    const itemsHtml = (order.items || []).map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} × ${item.quantity || 1}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price * (item.quantity || 1)}</td>
        </tr>
    `).join('');

    const customerEmail = order.customer?.email || order.shipping?.email;

    // Admin Mail
    const adminOptions = {
        from: `"Nature's Pledge Admin" <${process.env.EMAIL_USER}>`,
        to: ADMIN_EMAIL,
        subject: `🛒 New Order #${order.id} — ₹${order.total || order.totalAmount}`,
        html: `<div style="font-family: Arial;"><h1>New Order #${order.id}</h1><p>Customer: ${order.customer?.name || order.shipping?.fullName}</p><table>${itemsHtml}</table><p>Total: ₹${order.total || order.totalAmount}</p></div>`
    };

    // Customer Mail
    if (customerEmail && customerEmail !== 'Guest') {
        const customerOptions = {
            from: `"Nature's Pledge" <${process.env.EMAIL_USER}>`,
            to: customerEmail,
            subject: `✅ Order Confirmed — Nature's Pledge (#${order.id})`,
            html: `<div style="font-family: Arial;"><h1>Thank you for your order!</h1><p>Order ID: #${order.id}</p><table>${itemsHtml}</table><p>We are preparing your items for shipping.</p></div>`
        };
        try { await transporter.sendMail(customerOptions); } catch (e) { console.error("Customer email fail", e.message); }
    }

    try { await transporter.sendMail(adminOptions); } catch (e) { console.error("Admin email fail", e.message); }
};

// GET all orders
router.get('/', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: "DB connecting" });
        const orders = await Order.find().sort({ date: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new order
router.post('/', async (req, res) => {
    try {
        const orderData = {
            ...req.body,
            date: new Date().toISOString(),
            status: req.body.status || 'Processing'
        };

        if (mongoose.connection.readyState === 1) {
            const newOrder = new Order(orderData);
            await newOrder.save();
            sendEmails(newOrder).catch(console.error);
            return res.status(201).json(newOrder);
        }

        // Backup response for client if DB is sluggish
        res.status(201).json(orderData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE order status
router.patch('/:id', async (req, res) => {
    try {
        const order = await Order.findOneAndUpdate(
            { id: req.params.id },
            { status: req.body.status },
            { new: true }
        );
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE all orders (Admin Reset)
router.delete('/reset', async (req, res) => {
    try {
        await Order.deleteMany({});
        res.json({ success: true, message: 'All orders cleared!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
