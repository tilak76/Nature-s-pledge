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
    const [relatedVariants, setRelatedVariants] = useState([]);

    useEffect(() => {
        const found = products.find(p => p.id === parseInt(id));
        if (found) {
            setProduct(found);

            // Logic to find variants (same base name)
            const baseName = found.name.split(' - ')[0];
            const variants = products.filter(p => p.name.startsWith(baseName) && p.id !== found.id);
            setRelatedVariants(variants);

            const others = products.filter(p => p.category === found.category && p.id !== found.id && !p.name.startsWith(baseName));
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                        <span style={{ color: '#F4B400', fontSize: '1.2rem' }}>★★★★★</span>
                        <span style={{ color: '#007185', fontSize: '0.9rem', cursor: 'pointer' }}>1,204 ratings</span>
                        <span style={{ color: '#ccc' }}>|</span>
                        <span style={{ color: '#007185', fontSize: '0.9rem', cursor: 'pointer' }}>42 answered questions</span>
                    </div>

                    <div style={{ borderTop: '1px solid #e7e7e7', borderBottom: '1px solid #e7e7e7', padding: '1rem 0', marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '2rem', color: '#B12704', fontWeight: '500', lineHeight: '1' }}>
                            <span style={{ fontSize: '1rem', verticalAlign: 'top', color: '#565959' }}>₹</span>
                            {product.price}
                        </div>
                        <div style={{ color: '#565959', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                            M.R.P.: <span style={{ textDecoration: 'line-through' }}>₹{Math.floor(product.price * 1.3)}</span>
                            <span style={{ color: '#B12704', marginLeft: '5px' }}>(23% off)</span>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#007185', fontWeight: 'bold', marginTop: '0.5rem' }}>
                            Inclusive of all taxes
                        </div>
                    </div>

                    {/* Delivery Info */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ color: '#565959', fontSize: '0.95rem', marginBottom: '5px' }}>
                            <span style={{ color: '#007185', fontWeight: 'bold' }}>FREE Delivery</span> <span style={{ fontWeight: 'bold' }}>{new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}.</span>
                        </div>
                        <div style={{ fontSize: '1.2rem', color: '#007600', fontWeight: '500', marginBottom: '1rem' }}>
                            In Stock.
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#565959' }}>
                            Sold by <span style={{ color: '#007185' }}>Nature's Pledge Farmers Collective</span> and <span style={{ color: '#007185' }}>Fulfilled by Nature's Pledge</span>.
                        </div>
                    </div>

                    {/* Variant Selector */}
                    {relatedVariants.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#555', marginBottom: '0.5rem' }}>Size:</div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {/* Current Item */}
                                <button style={{
                                    padding: '8px 15px',
                                    background: '#fef8f3',
                                    border: '2px solid #e77600',
                                    borderRadius: '3px',
                                    cursor: 'default',
                                    fontWeight: 'bold',
                                    color: '#333'
                                }}>
                                    {product.name.split(' - ')[1] || 'Standard'}
                                </button>
                                {/* Other Variants */}
                                {relatedVariants.map(v => (
                                    <button
                                        key={v.id}
                                        onClick={() => navigate(`/product/${v.id}`)}
                                        style={{
                                            padding: '8px 15px',
                                            background: 'white',
                                            border: '1px solid #ccc',
                                            borderRadius: '3px',
                                            cursor: 'pointer',
                                            color: '#333'
                                        }}
                                    >
                                        {v.name.split(' - ')[1] || 'Standard'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
                        <button
                            onClick={() => {
                                addToCart(product);
                                showToast('Added to Cart!');
                            }}
                            style={{
                                padding: '12px', background: '#FFD814', color: '#0F1111',
                                border: 'none', borderRadius: '20px', fontWeight: '500', cursor: 'pointer', fontSize: '1rem',
                                boxShadow: '0 2px 5px rgba(213,217,217,0.5)'
                            }}
                        >
                            Add to Cart
                        </button>
                        <button
                            onClick={() => { addToCart(product); navigate('/checkout'); }}
                            style={{
                                padding: '12px', background: '#FFA41C', color: '#0F1111',
                                border: 'none', borderRadius: '20px', fontWeight: '500', cursor: 'pointer', fontSize: '1rem',
                                boxShadow: '0 2px 5px rgba(213,217,217,0.5)'
                            }}
                        >
                            Buy Now
                        </button>
                    </div>

                    <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#007185' }}>
                        <span>🔒 Secure transaction</span>
                    </div>

                    <p style={{ marginTop: '2rem', lineHeight: '1.6', fontSize: '1rem', color: '#333' }}>
                        <span style={{ fontWeight: 'bold' }}>About this item:</span><br />
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
