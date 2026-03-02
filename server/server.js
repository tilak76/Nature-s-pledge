const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Load environment variables early
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection (Serverless Optimized - only connects when needed)
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;

    // Safety check for production
    if (!process.env.MONGO_URI) {
        console.error('CRITICAL: MONGO_URI is not defined in environment variables');
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
            bufferCommands: false,
        });
        console.log('--- 🟢 MONGODB CONNECTED ---');
    } catch (err) {
        console.error('--- 🔴 MONGODB ERROR:', err.message);
    }
};

// Middleware to ensure DB is connected
app.use(async (req, res, next) => {
    try {
        await connectDB();
    } catch (e) {
        // Log but don't crash
        console.error('Middleware connection error');
    }
    next();
});

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/messages', require('./routes/messages'));

// Health Check
app.get('/api/health', (req, res) => {
    const isConnected = mongoose.connection.readyState === 1;
    let maskedUri = 'N/A';
    if (process.env.MONGO_URI) {
        maskedUri = process.env.MONGO_URI.substring(0, 15) + '...' + process.env.MONGO_URI.slice(-10);
    }

    res.json({
        status: 'ok',
        build: 'Nature_Pledge_V4_Stable',
        mongodb: isConnected ? 'connected' : 'disconnected',
        database: isConnected ? 'MongoDB Atlas (Cloud)' : 'Disconnected/Fallback',
        dbConfig: maskedUri,
        timestamp: new Date()
    });
});

// Port listener is ONLY for local development
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Local server listening on port ${PORT}`);
    });
}

// CRITICAL: Export for Vercel
module.exports = app;
