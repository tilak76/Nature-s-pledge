const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'tilakmishra.76@gmail.com';

const getTransporter = () => {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    return null;
};

// Notification helpers
const sendAdminNotification = async (msg) => {
    const transporter = getTransporter();
    if (!transporter) return;
    const mailOptions = {
        from: `"Nature's Pledge Support" <${process.env.EMAIL_USER}>`,
        to: ADMIN_EMAIL,
        subject: `💬 New Message from ${msg.userName} — Nature's Pledge`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:20px;border-radius:10px;">
            <h2 style="color:#5D4037;border-bottom:2px solid #8D6E63;padding-bottom:10px;">🌿 New Customer Message</h2>
            <table style="width:100%;background:white;border-radius:8px;padding:15px;border:1px solid #eee;">
                <tr><td style="padding:8px;color:#888;width:120px;"><strong>👤 Customer:</strong></td><td style="padding:8px;">${msg.userName}</td></tr>
                <tr><td style="padding:8px;color:#888;"><strong>📧 Email:</strong></td><td style="padding:8px;">${msg.userEmail || 'Not provided'}</td></tr>
                <tr><td style="padding:8px;color:#888;"><strong>🕒 Time:</strong></td><td style="padding:8px;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td></tr>
            </table>
            <div style="background:white;border-left:4px solid #8D6E63;margin:15px 0;padding:15px;border-radius:0 8px 8px 0;">
                <p style="margin:0;font-size:1.1rem;color:#333;">"${msg.text}"</p>
            </div>
            <a href="https://www.naturespledge.in/admin" style="display:inline-block;background:#5D4037;color:white;padding:12px 25px;border-radius:25px;text-decoration:none;font-weight:bold;margin-top:10px;">
                💬 Reply in Admin Panel
            </a>
        </div>`
    };
    try { await transporter.sendMail(mailOptions); } catch (err) { console.error("Admin Email fail:", err.message); }
};

const sendCustomerNotification = async (replyMsg) => {
    const transporter = getTransporter();
    if (!transporter) return;
    try {
        let targetEmail = replyMsg.userEmail;
        if (!targetEmail || targetEmail === 'Guest' || targetEmail === 'Admin') {
            const lastMsg = await Message.findOne({ userId: replyMsg.userId, isAdmin: false }).sort({ timestamp: -1 });
            if (lastMsg && lastMsg.userEmail && lastMsg.userEmail !== 'Guest') targetEmail = lastMsg.userEmail;
        }
        if (!targetEmail || targetEmail === 'Guest' || targetEmail === 'Admin') return;

        const mailOptions = {
            from: `"Nature's Pledge Support" <${process.env.EMAIL_USER}>`,
            to: targetEmail,
            subject: `🌿 Support Reply: Nature's Pledge`,
            html: `<div><p>Hi,</p><p>Our agent replied:</p><blockquote>"${replyMsg.text}"</blockquote></div>`
        };
        await transporter.sendMail(mailOptions);
    } catch (err) { console.error("Customer Email fail:", err.message); }
};

// GET messages for user
router.get('/:userId', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) return res.json([]);
        const messages = await Message.find({ userId: req.params.userId }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (err) { res.json([]); }
});

// POST message
router.post('/', async (req, res) => {
    try {
        const { userId, userName, userEmail, text, isAdmin } = req.body;
        const msgData = { userId, userName, userEmail, text, isAdmin, timestamp: new Date(), isRead: false };

        if (mongoose.connection.readyState === 1) {
            const msg = new Message(msgData);
            await msg.save();
            if (isAdmin) sendCustomerNotification(msgData).catch(console.error);
            else sendAdminNotification(msgData).catch(console.error);
            return res.json(msg);
        }
        res.json(msgData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Get all conversations
router.get('/admin/all', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) return res.json([]);
        const conversations = await Message.aggregate([
            { $sort: { timestamp: -1 } },
            {
                $group: {
                    _id: "$userId",
                    userName: { $max: { $cond: [{ $eq: ["$isAdmin", false] }, "$userName", null] } },
                    userEmail: { $max: { $cond: [{ $eq: ["$isAdmin", false] }, "$userEmail", null] } },
                    lastMessage: { $first: "$text" },
                    timestamp: { $first: "$timestamp" },
                    unreadCount: { $sum: { $cond: [{ $and: [{ $eq: ["$isAdmin", false] }, { $eq: ["$isRead", false] }] }, 1, 0] } }
                }
            },
            { $sort: { timestamp: -1 } }
        ]);
        res.json(conversations);
    } catch (err) { res.json([]); }
});

// Admin: Mark read
router.patch('/admin/read/:userId', async (req, res) => {
    try {
        await Message.updateMany({ userId: req.params.userId, isAdmin: false }, { isRead: true });
        res.json({ success: true });
    } catch (err) { res.json({ success: false }); }
});

// Admin: Resolve
router.delete('/admin/resolve/:userId', async (req, res) => {
    try {
        await Message.deleteMany({ userId: req.params.userId });
        res.json({ success: true });
    } catch (err) { res.json({ success: false }); }
});

module.exports = router;
