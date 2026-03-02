const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const envPath = path.join(__dirname, '.env');
console.log('Checking .env at:', envPath);
require('dotenv').config({ path: envPath });

if (!process.env.MONGO_URI) {
    console.error('--- 🔴 ERROR: MONGO_URI NOT FOUND IN .ENV FILE ---');
} else {
    console.log('--- 🟢 INFO: MONGO_URI loaded. Starts with:', process.env.MONGO_URI.substring(0, 15));
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const fullUri = process.env.MONGO_URI || 'mongodb://localhost:27017/walnut-shop';

mongoose.connect(fullUri, {
    serverSelectionTimeoutMS: 30000, // 30s for cloud stability
    connectTimeoutMS: 30000,
    heartbeatFrequencyMS: 10000,
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
