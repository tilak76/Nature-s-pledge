const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const ordersFilePath = path.join(__dirname, '../data/orders.json');

// Helper to read orders
const getOrders = () => {
    if (!fs.existsSync(ordersFilePath)) {
        return [];
    }
    const data = fs.readFileSync(ordersFilePath);
    return JSON.parse(data);
};

// Helper to save orders
const saveOrders = (orders) => {
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2));
};

// GET all orders (for Admin)
router.get('/', (req, res) => {
    try {
        const orders = getOrders();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new order
router.post('/', (req, res) => {
    try {
        const { customer, items, total, paymentMethod, transactionId } = req.body;
        const orders = getOrders();

        const newOrder = {
            id: Date.now(), // Simple ID
            date: new Date().toISOString(),
            customer,
            items,
            total,
            paymentMethod,
            transactionId,
            status: 'Pending'
        };

        orders.unshift(newOrder); // Add to top
        saveOrders(orders);

        res.status(201).json(newOrder);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
