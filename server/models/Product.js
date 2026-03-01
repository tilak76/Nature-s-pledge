const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: 'Walnut'
    },
    stock: {
        type: Number,
        default: 100
    },
    notes: {
        type: String,
        default: ''
    }
});


module.exports = mongoose.model('Product', productSchema);
