const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Local dev listener (if needed)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Dev backend live on ${PORT}`));
}

// MongoDB Connection
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000,
            bufferCommands: false,
        });
        console.log('MongoDB Hooked');
    } catch (err) {
        console.error('DB FAIL:', err.message);
    }
};

// Middleware to connect (BEFORE routes)
app.use(async (req, res, next) => {
    if (req.path === '/api/health' || req.path === '/api/hello') return next();
    await connectDB();
    next();
});

// Routes
app.use('/api/products', require('../server/routes/products'));
app.use('/api/orders', require('../server/routes/orders'));
app.use('/api/users', require('../server/routes/users'));
app.use('/api/messages', require('../server/routes/messages'));
app.use('/api/payment', require('../server/routes/payment'));

app.get('/api/hello', (req, res) => res.json({ msg: "Nature's Pledge API Live", build: 'fc073c8_v2' }));

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        build: 'NP_Final_Stable_V1'
    });
});

module.exports = app;
