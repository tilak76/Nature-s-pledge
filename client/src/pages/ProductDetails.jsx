import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);

    useEffect(() => {
        const found = products.find(p => p.id === parseInt(id));
        if (found) {
            setProduct(found);
            const others = products.filter(p => p.category === found.category && p.id !== found.id);
            setRelated(others.slice(0, 3));
            window.scrollTo(0, 0);
        } else {
            navigate('/shop');
        }
    }, [id, navigate]);

    if (!product) return <div className="container" style={{ padding: '4rem' }}>Loading...</div>;

    return (
        <div className="container product-details-page" style={{ padding: '4rem 0' }}>
            {/* Top Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
                {/* Image */}
                <div>
                    <img
                        src={product.image}
                        alt={product.name}
                        style={{ width: '100%', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: '4px solid white' }}
                    />
                </div>

                {/* Main Info */}
                <div>
                    <span style={{ color: '#2E7D32', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '1px' }}>
                        100% Authentic From Kashmir
                    </span>
                    <h1 style={{ fontSize: '2.8rem', marginTop: '0.5rem', marginBottom: '1rem', color: '#3E2723', fontFamily: '"Playfair Display", serif' }}>
                        {product.name}
                    </h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                        <span style={{ color: '#F4B400', fontSize: '1.2rem' }}>★★★★★</span>
                        <span style={{ color: '#666', fontSize: '0.9rem' }}>(Verified Purchase Reviews)</span>
                    </div>

                    <div style={{ fontSize: '2rem', color: '#2E7D32', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                        ₹{product.price}
                        <span style={{ fontSize: '1rem', color: '#999', fontWeight: 'normal', marginLeft: '10px', textDecoration: 'line-through' }}>
                            ₹{Math.floor(product.price * 1.3)}
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        <button
                            onClick={() => {
                                addToCart(product);
                                showToast('Added to Cart!');
                            }}
                            style={{
                                flex: 1, padding: '18px', background: 'white', color: '#3E2723',
                                border: '2px solid #3E2723', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            Add to Cart
                        </button>
                        <button
                            onClick={() => { addToCart(product); navigate('/checkout'); }} // Direct to Checkout for Buy Now
                            style={{
                                flex: 1.5, padding: '18px', background: '#2E7D32', color: 'white',
                                border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem',
                                boxShadow: '0 4px 15px rgba(46, 125, 50, 0.3)'
                            }}
                        >
                            Buy Now
                        </button>
                    </div>

                    <p style={{ lineHeight: '1.8', fontSize: '1.1rem', color: '#444', fontStyle: 'italic', borderLeft: '4px solid #2E7D32', paddingLeft: '15px' }}>
                        "{product.description}"
                    </p>
                </div>
            </div>

            {/* Storytelling Section */}
            <div style={{ background: '#fdfbf7', padding: '3rem', borderRadius: '16px', marginBottom: '4rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#3E2723', fontFamily: '"Playfair Display", serif' }}>
                    Khet Se Aap Tak (Farm to Home)
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏔️</div>
                        <h3 style={{ marginBottom: '1rem', color: '#2E7D32' }}>Origin Story</h3>
                        <p style={{ lineHeight: '1.6', color: '#555' }}>
                            {product.origin_story || "Sourced directly from the authentic regions of Jammu & Kashmir."}
                        </p>
                    </div>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>👨‍🌾</div>
                        <h3 style={{ marginBottom: '1rem', color: '#2E7D32' }}>Our Farmer's Promise</h3>
                        <p style={{ lineHeight: '1.6', color: '#555' }}>
                            {product.farm_story || "Hand-picked and traditionally processed to ensure you get the purest taste of nature."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Benefits Section */}
            <div style={{ marginBottom: '4rem' }}>
                <h2 style={{ marginBottom: '2rem', color: '#3E2723', fontFamily: '"Playfair Display", serif', textAlign: 'center' }}>
                    Why This is Good For You?
                </h2>
                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    {product.health_benefits && product.health_benefits.map((benefit, i) => (
                        <div key={i} style={{
                            padding: '1rem 2rem',
                            background: '#e8f5e9',
                            color: '#2E7D32',
                            borderRadius: '50px',
                            fontWeight: 'bold',
                            border: '1px solid #c8e6c9'
                        }}>
                            ✓ {benefit}
                        </div>
                    ))}
                    {!product.health_benefits && <div>100% Organic & Natural</div>}
                </div>
            </div>

            {/* Related Products */}
            {related.length > 0 && (
                <div style={{ marginTop: '4rem', borderTop: '1px solid #eee', paddingTop: '3rem' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontFamily: '"Playfair Display", serif' }}>You May Also Like</h2>
                    <div className="product-grid">
                        {related.map(p => (
                            <div key={p.id} className="product-card" onClick={() => navigate(`/product/${p.id}`)} style={{ cursor: 'pointer' }}>
                                <img src={p.image} alt={p.name} className="product-image" />
                                <div className="product-info">
                                    <h3 className="product-title">{p.name}</h3>
                                    <span className="product-price">₹{p.price}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetails;
