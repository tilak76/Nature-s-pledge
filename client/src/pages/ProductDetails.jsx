import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { products as staticProducts } from '../data/products';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import './ProductDetails.css';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { showToast } = useToast();
    const { user } = useAuth();

    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [relatedVariants, setRelatedVariants] = useState([]);

    // Review States
    const [reviews, setReviews] = useState([]);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchProductData = async () => {
            let fetchedProducts = [];
            try {
                const res = await axios.get('/api/products', { timeout: 3000 });
                if (res.data && res.data.length > 0) fetchedProducts = res.data;
                else fetchedProducts = staticProducts;
            } catch (err) {
                fetchedProducts = staticProducts;
            }

            const found = fetchedProducts.find(p => String(p.id) === String(id));

            if (found) {
                setProduct(found);
                const baseName = found.name.split(' - ')[0];
                const variants = fetchedProducts.filter(p => p.name.startsWith(baseName) && String(p.id) !== String(found.id));
                setRelatedVariants(variants);

                const others = fetchedProducts.filter(p => p.category === found.category && String(p.id) !== String(found.id) && !p.name.startsWith(baseName));
                setRelated(others.slice(0, 3));
                window.scrollTo(0, 0);
            } else {
                navigate('/shop');
            }
        };
        fetchProductData();
    }, [id, navigate]);

    // Fetch Reviews for this product
    useEffect(() => {
        if (!product) return;
        const fetchReviews = async () => {
            try {
                const res = await axios.get(`/api/products/${product.id}/reviews`);
                setReviews(res.data || []);
            } catch (err) {
                console.error("Failed to fetch reviews", err);
            }
        };
        fetchReviews();
    }, [product]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            showToast("Please login to post a review");
            navigate('/login');
            return;
        }
        if (!comment.trim()) {
            showToast("Please write a comment");
            return;
        }

        setSubmitting(true);
        try {
            const res = await axios.post(`/api/products/${product.id}/reviews`, {
                user: user.name || user.email.split('@')[0],
                rating,
                comment
            });
            setReviews([res.data, ...reviews]);
            setComment('');
            setShowReviewForm(false);
            setRating(5);
            showToast("Review posted successfully!");
        } catch (err) {
            showToast("Failed to post review. Is server running?");
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };


    if (!product) return <div className="container section-padding" style={{ textAlign: 'center' }}><p>Fetching Premium Selection...</p></div>;

    const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "5.0";

    return (
        <div className="container product-details-page">

            <div className="grid-luxury grid-luxury-2" style={{ marginBottom: '80px' }}>
                <div className="product-image-display">
                    <div className="premium-badge">100% Organic</div>
                    <img src={product.image} alt={product.name} />
                </div>

                <div className="product-info-wrapper">
                    <h2 className="product-origin-label">Authentic from Kashmir</h2>
                    <h1 className="product-detail-title">{product.name}</h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }} onClick={() => document.getElementById('reviews-section').scrollIntoView({ behavior: 'smooth' })}>
                        <span style={{ color: 'var(--accent)', fontSize: '1.2rem', letterSpacing: '2px' }}>
                            {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', borderLeft: '1px solid #eee', paddingLeft: '15px' }}>
                            {reviews.length} Verified Reviews
                        </span>
                    </div>

                    <div className="product-price-section">
                        <div className="current-price">
                            <span>₹</span>{product.price}
                        </div>
                        <div className="mrp-detail">
                            M.R.P.: <span>₹{Math.floor(product.price * 1.3)}</span>
                            <span className="discount-tag">Special Price (30% off)</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--primary-light)', fontWeight: '600', marginTop: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Inclusive of all taxes
                        </div>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <div style={{ color: 'var(--text-main)', fontSize: '1rem', marginBottom: '8px', fontWeight: '500' }}>
                            <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Free Priority Shipping</span> arriving by <span style={{ fontWeight: '700' }}>{new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}.</span>
                        </div>
                        <div style={{ fontSize: '1.1rem', color: '#4CAF50', fontWeight: '600', marginBottom: '15px' }}>
                            Harvest Ready. In Stock.
                        </div>
                    </div>

                    {relatedVariants.length > 0 && (
                        <div className="variant-selector-container">
                            <div className="variant-label">Select Size / Weight</div>
                            <div className="variant-buttons">
                                <button className="variant-btn active">
                                    {product.name.split(' - ')[1] || 'Standard'}
                                </button>
                                {relatedVariants.map(v => (
                                    <button
                                        key={v.id}
                                        onClick={() => navigate(`/product/${v.id}`)}
                                        className="variant-btn"
                                    >
                                        {v.name.split(' - ')[1] || 'Standard'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="action-buttons-group">
                        <button
                            onClick={() => {
                                addToCart(product);
                                showToast('Added to Cart!');
                            }}
                            className="btn-premium"
                        >
                            Add to Cart
                        </button>
                        <button
                            onClick={() => { addToCart(product); navigate('/checkout'); }}
                            className="btn-secondary"
                        >
                            Proced to Buy
                        </button>
                    </div>

                    <div className="about-item-section">
                        <h4>About this treasure</h4>
                        <p>{product.description}</p>
                    </div>
                </div>
            </div>

            {/* Farm to Home */}
            <div className="section-padding" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <h2 className="section-title">The Farm to Home Journey</h2>

                <div className="story-grid">
                    <div className="story-card">
                        <span className="icon">🏔️</span>
                        <h3>Origin Story</h3>
                        <p>{product.origin_story || "Cultivated in the pristine valleys of Kashmir, fed by glacial waters and mountain air."}</p>
                    </div>
                    <div className="story-card">
                        <span className="icon">🌿</span>
                        <h3>Farmer's Promise</h3>
                        <p>{product.farm_story || "Hand-harvested by local artisans using generational wisdom, ensuring absolute purity."}</p>
                    </div>
                </div>
            </div>

            {/* Benefits */}
            <div className="section-padding" style={{ paddingBottom: '20px' }}>
                <h2 className="section-title">Nourishing Benefits</h2>
                <div className="health-benefits-container">
                    {product.health_benefits && product.health_benefits.map((benefit, i) => (
                        <div key={i} className="benefit-pill">✓ {benefit}</div>
                    ))}
                    {!product.health_benefits && <div className="benefit-pill">✓ Pure & Organic Nutrition</div>}
                </div>
            </div>

            {/* Original Reviews Section */}
            <div id="reviews-section" className="section-padding reviews-section">
                <div className="reviews-header">
                    <div>
                        <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '10px' }}>Customer Reviews</h2>
                        <div className="reviews-summary">
                            <span className="average-rating">{avgRating}</span>
                            <div className="stars">
                                {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}
                            </div>
                            <p>Based on {reviews.length} authentic reviews</p>
                        </div>
                    </div>
                    <button className="write-review-btn" onClick={() => setShowReviewForm(!showReviewForm)}>
                        {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                    </button>
                </div>

                {showReviewForm && (
                    <div className="review-form-container">
                        <form onSubmit={handleReviewSubmit}>
                            <h4 style={{ marginBottom: '10px', color: 'var(--primary)' }}>Rate this item</h4>
                            <div className="star-rating-input">
                                {[5, 4, 3, 2, 1].map(num => (
                                    <React.Fragment key={num}>
                                        <input
                                            type="radio"
                                            id={`star${num}`}
                                            name="rating"
                                            value={num}
                                            checked={rating === num}
                                            onChange={() => setRating(num)}
                                        />
                                        <label htmlFor={`star${num}`}>★</label>
                                    </React.Fragment>
                                ))}
                            </div>

                            <textarea
                                className="review-textarea"
                                placeholder="Share your experience with this Kashmiri gem..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            ></textarea>

                            <button type="submit" className="btn-premium" disabled={submitting}>
                                {submitting ? 'Posting...' : 'Post Review'}
                            </button>
                        </form>
                    </div>
                )}

                <div className="reviews-list">
                    {reviews.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                            Be the first to share your authentic experience!
                        </p>
                    ) : (
                        reviews.map((r, i) => (
                            <div key={i} className="review-card">
                                <div className="review-header">
                                    <div className="reviewer-info">
                                        <div className="reviewer-avatar">
                                            {r.user.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="reviewer-name">
                                                {r.user}
                                                <span className="verified-buyer">Verified Buyer ✓</span>
                                            </div>
                                            <div className="review-stars">
                                                {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="review-date">
                                        {new Date(r.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                                <p className="review-comment">{r.comment}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Related */}
            {related.length > 0 && (
                <div className="section-padding" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <h2 className="section-title">You May Also Like</h2>
                    <div className="grid-luxury grid-luxury-3">
                        {related.map(p => (
                            <div key={p.id} className="product-card" onClick={() => navigate(`/product/${p.id}`)}>
                                <div className="product-image-container">
                                    <img src={p.image} alt={p.name} className="product-image" />
                                </div>
                                <div className="product-info" style={{ textAlign: 'center', padding: '20px' }}>
                                    <h3 className="product-title" style={{ fontSize: '1.2rem' }}>{p.name}</h3>
                                    <span className="product-price" style={{ fontSize: '1.1rem' }}>₹{p.price}</span>
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
