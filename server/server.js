const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with shorter timeout to trigger fallback quickly
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/walnut-shop', {
    serverSelectionTimeoutMS: 3000,
    connectTimeoutMS: 3000,
    bufferCommands: false // Fail fast if DB is not connected
})
    .then(() => console.log('MongoDB connected...'))
    .catch(err => {
        console.warn('MongoDB Unavailable. Using JSON Files Only.');
    });

app.use('/api/products', require('./routes/products'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/messages', require('./routes/messages'));

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
