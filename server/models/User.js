const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false }, // Only for email/pass users
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    phoneNumber: { type: String }, // For Phone-OTP users
    image: { type: String }, // For Google users
    lastLogin: { type: Date, default: Date.now },
    walletBalance: { type: Number, default: 0 },
    walletHistory: { type: Array, default: [] },
    cart: { type: Array, default: [] }, // Abandoned Cart Tracking
    lastCartUpdate: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
