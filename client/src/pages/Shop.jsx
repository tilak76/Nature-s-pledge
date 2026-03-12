import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { products as staticProducts } from '../data/products';
import './Shop.css';

const Shop = () => {
    const { logActivity } = useAuth();
    const [groupedProducts, setGroupedProducts] = useState([]);
    const [displayProducts, setDisplayProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [category, setCategory] = useState('All');
    const [selectedBaseProduct, setSelectedBaseProduct] = useState(null);

    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { showToast } = useToast();

    // Debouncing Logic for Search
    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms delay

        return () => {
            clearTimeout(timerId);
        };
    }, [searchTerm]);

    useEffect(() => {
        logActivity('Browsing Shop');
    }, []);

    const categories = ['All', 'Walnut', 'Almond', 'Rajma', 'Atta', 'Chutney'];

    useEffect(() => {
        const fetchAndGroupProducts = async () => {
            let dataToProcess = [];
            try {
                const response = await axios.get('/api/products');
                if (response.data && response.data.length > 0) {
                    dataToProcess = response.data;
                } else {
                    dataToProcess = staticProducts;
                }
            } catch (err) {
                dataToProcess = staticProducts;
            }

            const groups = {};
            dataToProcess.forEach(product => {
                const nameParts = product.name.split(' - ');
                const baseName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' - ') : product.name;
                const weight = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'Standard';

                if (!groups[baseName]) {
                    groups[baseName] = {
                        baseName: baseName,
                        category: product.category,
                        description: product.description,
                        image: product.image,
                        variants: []
                    };
                }
                groups[baseName].variants.push({
                    ...product,
                    weightLabel: weight
                });
            });

            const groupedArray = Object.values(groups);
            setGroupedProducts(groupedArray);
            setDisplayProducts(groupedArray);
            setLoading(false);
        };

        fetchAndGroupProducts();
    }, []);

    useEffect(() => {
        let filtered = groupedProducts;
        if (category !== 'All') {
            filtered = filtered.filter(p => (p.baseName.toLowerCase().includes(category.toLowerCase()) || p.category.toLowerCase().includes(category.toLowerCase())));
        }
        if (debouncedSearchTerm) {
            filtered = filtered.filter(p => p.baseName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
        }
        setDisplayProducts(filtered);
    }, [debouncedSearchTerm, category, groupedProducts]);

    const handleAddToCartClick = (e, productGroup) => {
        e.stopPropagation();
        setSelectedBaseProduct(productGroup);
    };

    const handleVariantSelect = (variant) => {
        addToCart(variant);
        showToast(`${variant.name} Added to Cart!`);
        setSelectedBaseProduct(null);
    };

    return (
        <div className="shop-page container">
            <h1 className="shop-header-title">Our Premium Collection</h1>

            <div className="categories-filter">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`filter-btn ${category === cat ? 'active' : ''}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="search-wrapper">
                <input
                    type="text"
                    className="search-bar"
                    placeholder="Search for authentic kashmiri gems..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <p>Loading the finest collection...</p>
                </div>
            ) : (
                <div className="product-grid">
                    {displayProducts.map((group, index) => (
                        <div key={index} className="product-card" onClick={() => navigate(`/product/${group.variants[0].id}`)}>
                            <div className="product-image-container">
                                <div className="premium-badge">100% Organic</div>
                                <img src={group.image} alt={group.baseName} className="product-image" />
                            </div>
                            <div className="product-info">
                                <span className="product-category">{group.category}</span>
                                <h3 className="product-title">{group.baseName}</h3>

                                <div className="price-box">
                                    <div className="product-price">
                                        ₹{group.variants.length > 1
                                            ? Math.min(...group.variants.map(v => v.price))
                                            : group.variants[0].price}
                                    </div>
                                    <div className="mrp-text">
                                        M.R.P.: <span>₹{Math.floor(group.variants[0].price * 1.3)}</span>
                                        <span className="discount-tag">30% OFF</span>
                                    </div>
                                    <div className="shipping-info">Alpine Fresh Shipping</div>
                                </div>

                                <button className="btn-premium" style={{ width: '100%', marginTop: '20px', padding: '12px' }} onClick={(e) => handleAddToCartClick(e, group)}>
                                    Select Options
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedBaseProduct && (
                <div className="modal-overlay" onClick={() => setSelectedBaseProduct(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedBaseProduct(null)}>×</button>
                        <h2 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Select Quantity</h2>
                        <p style={{ color: 'var(--text-muted)' }}>{selectedBaseProduct.baseName}</p>

                        <div className="variant-list">
                            {selectedBaseProduct.variants
                                .sort((a, b) => a.price - b.price)
                                .map(variant => (
                                    <div key={variant.id} className="variant-option" onClick={() => handleVariantSelect(variant)}>
                                        <span className="variant-weight" style={{ fontWeight: '600' }}>{variant.weightLabel}</span>
                                        <span className="variant-price" style={{ color: 'var(--primary)', fontWeight: '700' }}>₹{variant.price}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Shop;
