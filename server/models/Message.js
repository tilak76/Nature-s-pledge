const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userEmail: { type: String },
    text: { type: String, required: true },
    isAdmin: { type: Boolean, default: false }, // true if admin is replying
    isRead: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
