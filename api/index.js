const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Load environment (Vercel uses its own)
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Main App Routes (Require from server folder)
const products = require('../server/routes/products');
const orders = require('../server/routes/orders');
const users = require('../server/routes/users');
const messages = require('../server/routes/messages');
const payment = require('../server/routes/payment');

// Basic Standalone
app.get('/api/v1/ping', (req, res) => res.json({ status: "Nature's Pledge API is Alive v22" }));

// MongoDB Connection with careful singleton pattern
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000,
            bufferCommands: false
        });
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('DB FAIL:', err.message);
    }
};

// Middleware for DB
app.use(async (req, res, next) => {
    if (req.path.startsWith('/api/v1/ping')) return next();
    await connectDB();
    next();
});

// Implementation
app.use('/api/products', products);
app.use('/api/orders', orders);
app.use('/api/users', users);
app.use('/api/messages', messages);
app.use('/api/payment', payment);

// Fallback for API
app.get('/api/*', (req, res) => {
    res.json({
        service: "nature-pledge-backend",
        env: process.env.NODE_ENV,
        node: process.version,
        readyState: mongoose.connection.readyState
    });
});

module.exports = app;
