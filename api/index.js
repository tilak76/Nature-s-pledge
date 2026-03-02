const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Load env (for local only, Vercel uses its own)
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Standalone health route (No DB, NO EXTERNAL REQUIRES)
app.get('/api/ping', (req, res) => {
    res.json({
        msg: "Nature's Pledge API is Responding",
        build: 'fc073c8_v8',
        timestamp: new Date().toISOString()
    });
});

// 2. Variable Check (Masked)
app.get('/api/vars', (req, res) => {
    res.json({
        MONGO_URI: process.env.MONGO_URI ? "READY" : "MISSING",
        RAZORPAY: process.env.RAZORPAY_KEY_ID ? "READY" : "MISSING",
        EMAIL: process.env.EMAIL_USER ? "READY" : "MISSING"
    });
});

// 3. MongoDB Hook with Timeout
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    if (!process.env.MONGO_URI) {
        console.error("DB FAIL: MONGO_URI is not set!");
        return;
    }
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000,
            bufferCommands: false
        });
        console.log('MongoDB Hooked');
    } catch (err) {
        console.error('DB FAIL:', err.message);
    }
};

// 4. Load routes defensively
let products, orders, users, messages, payment;
try {
    products = require('../server/routes/products');
    orders = require('../server/routes/orders');
    users = require('../server/routes/users');
    messages = require('../server/routes/messages');
    payment = require('../server/routes/payment');
} catch (e) {
    console.error("ROUTE LOAD ERROR:", e.message);
}

// 5. App Middleware
app.use(async (req, res, next) => {
    if (req.path.startsWith('/api/ping') || req.path.startsWith('/api/vars')) return next();
    await connectDB();
    next();
});

// 6. Define Routes if loaded
if (products) app.use('/api/products', products);
if (orders) app.use('/api/orders', orders);
if (users) app.use('/api/users', users);
if (messages) app.use('/api/messages', messages);
if (payment) app.use('/api/payment', payment);

// 7. Standard Health
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'connecting/disconnected',
        build: 'NP_Final_Stable_V1'
    });
});

// 8. Global Error Handler
app.use((err, req, res, next) => {
    console.error("Express Error:", err.stack);
    res.status(500).json({ error: "Serverless Runtime Error", details: err.message });
});

module.exports = app;
