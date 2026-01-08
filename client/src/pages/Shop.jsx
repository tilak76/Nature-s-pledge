import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { products as staticProducts } from '../data/products';

import { useNavigate } from 'react-router-dom';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('All');
    const navigate = useNavigate();
    const { showToast } = useToast();

    const categories = ['All', 'Walnut', 'Almond', 'Rajma', 'Atta', 'Chutney']; // Enhanced categories

    useEffect(() => {
        filterProducts(searchTerm, category);
        setLoading(false);
    }, [searchTerm, category]);

    const filterProducts = (term, cat) => {
        let filtered = staticProducts;

        if (cat !== 'All') {
            filtered = filtered.filter(p => p.name.includes(cat) || p.category.includes(cat));
        }

        if (term) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(term.toLowerCase())
            );
        }
        setProducts(filtered);
    };

    const handleSearch = (e) => setSearchTerm(e.target.value);

    const { addToCart } = useCart();

    const handleAddToCart = (e, product) => {
        e.stopPropagation(); // Prevent navigation when clicking Add to Cart
        addToCart(product);
        alert('Added to cart!');
    };

    return (
        <div className="container shop-page">
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Our Premium Collection</h2>

            {/* Filters */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        style={{
                            padding: '8px 20px',
                            borderRadius: '30px',
                            border: `1px solid ${category === cat ? '#5D4037' : '#ddd'}`,
                            background: category === cat ? '#5D4037' : 'white',
                            color: category === cat ? 'white' : '#5D4037',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <input
                type="text"
                className="search-bar"
                placeholder="Search for walnuts..."
                value={searchTerm}
                onChange={handleSearch}
            />

            {loading ? (
                <p style={{ textAlign: 'center' }}>Loading fresh walnuts...</p>
            ) : (
                <div className="product-grid">
                    {products.map(product => (
                        <div
                            key={product.id || product._id}
                            className="product-card"
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate(`/product/${product.id}`)}
                        >
                            <img src={product.image} alt={product.name} className="product-image" />
                            <div className="product-info">
                                <h3 className="product-title">{product.name}</h3>
                                <span className="product-price">₹{product.price}</span>
                                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                                    {product.description}
                                </p>
                                <button
                                    className="add-btn"
                                    onClick={(e) => handleAddToCart(e, product)}
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Shop;
