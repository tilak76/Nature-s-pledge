const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
// Load environment variables
require('dotenv').config();

const app = express();

// Safe Database State Tracking
let dbConnection = null;

const connectDB = async () => {
    // Only proceed if URI exists and we aren't already connected
    if (mongoose.connection.readyState >= 1) return;
    if (!process.env.MONGO_URI) {
        console.warn('--- ⚠️ MONGO_URI is missing. Backend operating in LIMITED/JSON mode ---');
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 8000, // 8s timeout
            connectTimeoutMS: 8000,
            bufferCommands: false
        });
        console.log('--- 🟢 DB READY ---');
    } catch (err) {
        console.error('--- 🔴 DB CONNECTION ERROR ---', err.message);
    }
};

// Initial background attempt
connectDB();

// Middleware to ensure DB is connected on every request
app.use(async (req, res, next) => {
    try {
        await connectDB();
    } catch (e) {
        console.error('Connection middleware failed');
    }
    next();
});

app.use('/api/products', require('./routes/products'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/messages', require('./routes/messages'));

// Health Check
app.get('/api/health', (req, res) => {
    const isConnected = mongoose.connection.readyState === 1;
    res.json({
        status: 'ok',
        build: 'Nature_Pledge_V2_Atlas',
        mongodb: isConnected ? 'connected' : 'disconnected',
        database: isConnected ? 'MongoDB Atlas (Cloud)' : 'Local JSON Fallback',
        timestamp: new Date()
    });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
