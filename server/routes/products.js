const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products || []);
    } catch (err) {
        console.error("Products fetch error:", err.message);
        res.status(500).json({ message: "Server database error" });
    }
});

// Search products
router.get('/search', async (req, res) => {
    const { q } = req.query;
    try {
        const products = await Product.find({
            name: { $regex: q || '', $options: 'i' }
        });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create product (Admin)
router.post('/', async (req, res) => {
    try {
        const product = new Product(req.body);
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete product (Admin)
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            const productById = await Product.findOne({ id: req.params.id });
            if (!productById) return res.status(404).json({ message: 'Product not found' });
            await Product.deleteOne({ id: req.params.id });
        } else {
            await Product.deleteOne({ _id: req.params.id });
        }
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
