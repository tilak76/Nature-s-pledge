const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    trackingNumber: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: 'Pending'
    },
    items: [{
        id: Number,
        name: String,
        price: Number,
        quantity: Number,
        image: String
    }],
    total: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    transactionId: {
        type: String
    },
    customer: {
        name: String,
        phone: String,
        city: String,
        address: String,
        pincode: String,
        email: String
    },
    updates: [{
        status: String,
        location: String,
        time: String,
        completed: Boolean
    }],
    notes: {
        type: String,
        default: ''
    }
}, { timestamps: true });


module.exports = mongoose.model('Order', orderSchema);
