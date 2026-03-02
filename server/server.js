const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Load environment variables early
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection (Serverless Optimized)
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;

    if (!process.env.MONGO_URI) {
        console.error('CRITICAL ERROR: MONGO_URI is not defined in Vercel settings');
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000,
            bufferCommands: false,
        });
        console.log('--- 🟢 MONGODB CONNECTED ---');
    } catch (err) {
        console.error('--- 🔴 MONGODB FAILED:', err.message);
    }
};

// Ensure DB is ready for requests
app.use(async (req, res, next) => {
    try {
        await connectDB();
    } catch (e) {
        console.error('Connection middleware catch-all');
    }
    next();
});

// Routes
const productRoutes = require('./routes/products');
const paymentRoutes = require('./routes/payment');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');

app.use('/api/products', productRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    const isConnected = mongoose.connection.readyState === 1;
    res.json({
        status: 'ok',
        mongodb: isConnected ? 'connected' : 'disconnected',
        build: 'Nature_Pledge_Production_V1',
        timestamp: new Date()
    });
});

// Port listener for local
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Backend live on ${PORT}`));
}

// Export for Vercel
module.exports = app;
