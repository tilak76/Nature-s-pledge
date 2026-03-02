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

// MongoDB Connection with serverless-friendly timeouts
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/walnut-shop', {
    serverSelectionTimeoutMS: 5000, // Reduced to 5s for Vercel speed
    connectTimeoutMS: 5000,
    bufferCommands: true
})
    .then(() => {
        console.log('--- 🟢 PRODUCTION READY: Connected to MongoDB ATLAS ---');
    })
    .catch(err => {
        console.error('--- 🔴 CRITICAL ERROR: MongoDB Connection Failed! ---');
        console.error('Business data cannot be saved without DB. Error:', err.message);
        // In production, we want the server to notify us if DB is down
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
