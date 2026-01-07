const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/products.json');

const getProducts = () => {
    const jsonData = fs.readFileSync(dataPath);
    return JSON.parse(jsonData);
};

// Get all products
router.get('/', (req, res) => {
    try {
        const products = getProducts();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Search products
router.get('/search', (req, res) => {
    const { q } = req.query;
    try {
        const products = getProducts();
        const filtered = products.filter(p =>
            p.name.toLowerCase().includes(q.toLowerCase())
        );
        res.json(filtered);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
