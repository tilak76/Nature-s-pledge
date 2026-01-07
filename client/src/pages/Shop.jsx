import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { products as staticProducts } from '../data/products';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setProducts(staticProducts);
        setLoading(false);
    }, []);

    const fetchProducts = (term = '') => {
        const filtered = staticProducts.filter(p =>
            p.name.toLowerCase().includes(term.toLowerCase())
        );
        setProducts(filtered);
    };

    const { addToCart } = useCart();

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        fetchProducts(e.target.value);
    };

    const handleAddToCart = (product) => {
        addToCart(product);
        // Optional: Toast notification here
    };

    return (
        <div className="container shop-page">
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
                        <div key={product.id || product._id} className="product-card">
                            <img src={product.image} alt={product.name} className="product-image" />
                            <div className="product-info">
                                <h3 className="product-title">{product.name}</h3>
                                <span className="product-price">₹{product.price}</span>
                                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                                    {product.description}
                                </p>
                                <button
                                    className="add-btn"
                                    onClick={() => handleAddToCart(product)}
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
