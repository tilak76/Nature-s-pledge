const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'tilakmishra.76@gmail.com';

const sendLoginAlert = async (userData, isNew) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });
        const subject = isNew
            ? `🎉 New User Registered — ${userData.name || userData.email}`
            : `🔔 User Logged In — ${userData.name || userData.email}`;
        const html = `
            <div style="font-family:Arial;padding:20px;background:#f9f9f9">
                <h2 style="color:#5D4037">${isNew ? '🌿 New Registration!' : '👋 User Login'}</h2>
                <p><strong>Name:</strong> ${userData.name || 'N/A'}</p>
                <p><strong>Email:</strong> ${userData.email || userData.phoneNumber || 'N/A'}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                <p><strong>Type:</strong> ${isNew ? 'NEW ACCOUNT' : 'Returning User'}</p>
            </div>`;
        await transporter.sendMail({ from: `"Nature's Pledge" <${process.env.EMAIL_USER}>`, to: ADMIN_EMAIL, subject, html });
    } catch (err) {
        console.error('Login alert email failed:', err.message);
    }
};

// Get all users
router.get('/', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ message: "Database connecting..." });
        }
        const dbUsers = await User.find().sort({ lastLogin: -1 });
        res.json(dbUsers);
    } catch (err) {
        console.error("Users fetch error:", err.message);
        res.status(500).json({ message: "Server error" });
    }
});

// Sync User with Backend (on Login/Signup)
router.post('/sync', async (req, res) => {
    const { email, phoneNumber, name, image, role } = req.body;

    try {
        if (mongoose.connection.readyState !== 1) throw new Error("DB Disconnected");

        let user;
        if (email) {
            user = await User.findOne({ email });
        } else if (phoneNumber) {
            user = await User.findOne({ phoneNumber });
        }

        if (user) {
            user.lastLogin = Date.now();
            if (name) user.name = name;
            if (image) user.image = image;
            if (role) user.role = role;
            await user.save();
            // Send login alert to admin (non-blocking)
            sendLoginAlert({ name: user.name, email: user.email, phoneNumber: user.phoneNumber }, false).catch(() => { });
        } else {
            user = new User({
                email, phoneNumber, name: name || 'Nature Pledge User',
                image, role: role || 'user', lastLogin: Date.now(),
                createdAt: Date.now()
            });
            await user.save();
            // Send new registration alert to admin (non-blocking)
            sendLoginAlert({ name: user.name, email: user.email, phoneNumber: user.phoneNumber }, true).catch(() => { });
        }

        res.json(user);
    } catch (err) {
        console.warn("Sync user DB fail:", err.message);
        res.json({ ...req.body, _id: 'local_' + Date.now(), lastLogin: Date.now() });
    }
});

// Activity Logs
router.get('/logs', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) throw new Error("DB Disconnected");
        const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(50);
        res.json(logs);
    } catch (err) {
        res.json([]);
    }
});

router.post('/log-activity', async (req, res) => {
    const { userId, userName, userEmail, action, details } = req.body;
    const logData = { userId, userName, userEmail, action, details, timestamp: new Date() };

    try {
        if (mongoose.connection.readyState === 1) {
            const log = new ActivityLog(logData);
            await log.save();
            return res.json(log);
        }
        res.json(logData);
    } catch (err) {
        res.json(logData);
    }
});

// Cart Sync for Abandoned Cart Detection
router.post('/sync-cart', async (req, res) => {
    const { email, phoneNumber, cart } = req.body;
    try {
        if (mongoose.connection.readyState === 1) {
            let user;
            if (email) user = await User.findOne({ email });
            else if (phoneNumber) user = await User.findOne({ phoneNumber });

            if (user) {
                user.cart = cart;
                user.lastCartUpdate = new Date();
                await user.save();
                return res.json({ success: true, message: 'Cart synced' });
            }
        }
        res.json({ success: false, message: 'DB not connected' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE all users (Admin Reset)
router.delete('/reset', async (req, res) => {
    try {
        await User.deleteMany({});
        res.json({ success: true, message: 'All users cleared!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
