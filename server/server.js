const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
// Load environment variables
require('dotenv').config();

if (!process.env.MONGO_URI) {
    console.log('--- ⚠️ WARNING: MONGO_URI missing from environment ---');
} else {
    const maskedUri = process.env.MONGO_URI.substring(0, 15) + '...';
    console.log('--- 🟢 INFO: MONGO_URI is present. Starts with:', maskedUri);
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection (Serverless Optimized)
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
            bufferCommands: false
        });
        console.log('--- 🟢 DB CONNECTED ---');
    } catch (err) {
        console.log('--- 🔴 DB CONNECTION ERROR ---', err.message);
    }
};

// Initial background attempt
connectDB();

// Middleware to ensure DB is connected on every request
app.use(async (req, res, next) => {
    await connectDB();
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
