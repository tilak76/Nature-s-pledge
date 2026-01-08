import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { products as staticProducts } from '../data/products';
import { useNavigate } from 'react-router-dom';
import './Shop.css';

const Shop = () => {
    const [groupedProducts, setGroupedProducts] = useState([]);
    const [displayProducts, setDisplayProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('All');
    const [selectedBaseProduct, setSelectedBaseProduct] = useState(null); // For Modal

    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { showToast } = useToast();

    const categories = ['All', 'Walnut', 'Almond', 'Rajma', 'Atta', 'Chutney'];

    // Grouping Logic
    useEffect(() => {
        const groups = {};

        staticProducts.forEach(product => {
            // Extract base name (e.g., "Kashmiri Almond" from "Kashmiri Almond - 500g")
            // Use the part before the last " - " as the base name, or the whole name if no separator
            const nameParts = product.name.split(' - ');
            const baseName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' - ') : product.name;
            const weight = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'Standard';

            if (!groups[baseName]) {
                groups[baseName] = {
                    baseName: baseName,
                    category: product.category,
                    description: product.description,
                    image: product.image, // Use image of the first variant
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
    }, []);

    // Filtering Logic
    useEffect(() => {
        let filtered = groupedProducts;

        if (category !== 'All') {
            filtered = filtered.filter(p => p.baseName.includes(category) || p.category.includes(category));
        }

        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.baseName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setDisplayProducts(filtered);
    }, [searchTerm, category, groupedProducts]);

    const handleAddToCartClick = (e, productGroup) => {
        e.stopPropagation();
        setSelectedBaseProduct(productGroup);
    };

    const handleVariantSelect = (variant) => {
        addToCart(variant);
        alert(`Added ${variant.name} to cart!`);
        setSelectedBaseProduct(null); // Close modal
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
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {loading ? (
                <p style={{ textAlign: 'center' }}>Loading...</p>
            ) : (
                <div className="product-grid">
                    {displayProducts.map((group, index) => (
                        <div
                            key={index}
                            className="product-card"
                            onClick={() => handleAddToCartClick({ stopPropagation: () => { } }, group)} // Open modal on card click too
                        >
                            <img src={group.image} alt={group.baseName} className="product-image" />
                            <div className="product-info">
                                <span className="product-category">{group.category}</span>
                                {/* Amazon-style Rating */}
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                                    <span style={{ color: '#F4B400', fontSize: '1rem' }}>★★★★☆</span>
                                    <span style={{ fontSize: '0.8rem', color: '#007185', marginLeft: '4px' }}>124</span>
                                </div>

                                {/* Amazon-style Price Layout */}
                                <div className="amazon-price-container">
                                    <div className="product-price">
                                        {group.variants.length > 1
                                            ? `₹${Math.min(...group.variants.map(v => v.price))} - ₹${Math.max(...group.variants.map(v => v.price))}`
                                            : `₹${group.variants[0].price}`
                                        }
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#565959', marginTop: '2px' }}>
                                        M.R.P.: <span style={{ textDecoration: 'line-through' }}>₹{Math.floor(group.variants[0].price * 1.4)}</span>
                                        <span style={{ color: '#CC0C39', marginLeft: '6px' }}>(28% off)</span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#007185', fontWeight: 'bold', marginTop: '4px' }}>
                                        FREE Delivery by Nature's Pledge
                                    </div>
                                </div>

                                <button
                                    className="add-btn"
                                    onClick={(e) => handleAddToCartClick(e, group)}
                                    style={{ marginTop: 'auto' }}
                                >
                                    Select Options
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Variant Selection Modal */}
            {selectedBaseProduct && (
                <div className="modal-overlay" onClick={() => setSelectedBaseProduct(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedBaseProduct(null)}>×</button>

                        <h3 style={{ marginBottom: '0.5rem' }}>Select Quantity</h3>
                        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                            for {selectedBaseProduct.baseName}
                        </p>

                        <div className="variant-list">
                            {selectedBaseProduct.variants
                                .sort((a, b) => a.price - b.price) // Sort by price usually correlates with common weight order
                                .map(variant => (
                                    <div
                                        key={variant.id}
                                        className="variant-option"
                                        onClick={() => handleVariantSelect(variant)}
                                    >
                                        <span className="variant-weight">{variant.weightLabel}</span>
                                        <span className="variant-price">₹{variant.price}</span>
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
