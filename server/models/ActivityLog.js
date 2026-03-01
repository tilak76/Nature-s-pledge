const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userEmail: { type: String },
    action: { type: String, required: true }, // e.g., 'Login', 'Viewed Walnut', 'Created Order'
    details: { type: Object },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', logSchema);
