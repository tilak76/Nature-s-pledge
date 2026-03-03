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

    // Core states
    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [relatedVariants, setRelatedVariants] = useState([]);

    // E-commerce states
    const [quantity, setQuantity] = useState(1);
    const [pincode, setPincode] = useState('');
    const [pincodeStatus, setPincodeStatus] = useState('');
    const [activeImage, setActiveImage] = useState('');
    const [activeTab, setActiveTab] = useState('description');

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
                setActiveImage(found.image);
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

    const handleAddToCart = () => {
        // Use cart context addToCart with quantity override if supported, else add multiple times
        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }
        showToast(`${quantity}x Added to Cart!`);
    };

    const handleBuyNow = () => {
        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }
        navigate('/checkout');
    };

    const checkPincode = () => {
        if (pincode.length !== 6) return setPincodeStatus('Invalid Pincode');
        setPincodeStatus('Checking...');
        setTimeout(() => setPincodeStatus('Delivery available in 3-5 days!'), 1000);
    };

    if (!product) return <div className="container section-padding" style={{ textAlign: 'center' }}><p>Fetching Premium Selection...</p></div>;

    const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "5.0";

    // Simulate fake gallery thumbnails from same image
    const galleryItems = [product.image, product.image, product.image];

    return (
        <div className="container product-details-page">

            <div className="product-main-layout">
                {/* 1. Gallery Section */}
                <div className="product-gallery">
                    <div className="main-image-display">
                        <div className="premium-badge">100% Organic</div>
                        <img src={activeImage} alt={product.name} />
                    </div>
                    <div className="thumbnail-list">
                        {galleryItems.map((img, idx) => (
                            <div
                                key={idx}
                                className={`thumbnail-box ${activeImage === img ? 'active' : ''}`}
                                onMouseEnter={() => setActiveImage(img)}
                            >
                                <img src={img} alt={`${product.name} angle ${idx + 1}`} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Product Info Section */}
                <div className="product-info-wrapper">
                    <h2 className="product-origin-label">Authentic from Kashmir</h2>
                    <h1 className="product-detail-title">{product.name}</h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }} onClick={() => document.getElementById('reviews-section').scrollIntoView({ behavior: 'smooth' })}>
                        <span style={{ color: 'var(--accent)', fontSize: '1.2rem', letterSpacing: '2px' }}>
                            {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}
                        </span>
                        <span style={{ color: '#007185', fontSize: '0.9rem', borderLeft: '1px solid #eee', paddingLeft: '15px' }}>
                            {reviews.length} Verified Reviews
                        </span>
                    </div>

                    <div className="product-price-section">
                        <div className="current-price">
                            <span>₹</span>{product.price}
                        </div>
                        <div className="mrp-detail">
                            M.R.P.: <span>₹{Math.floor(product.price * 1.3)}</span>
                            <span className="discount-tag">30% Off</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '8px' }}>
                            Inclusive of all taxes
                        </div>
                    </div>

                    <ul className="amazon-bullet-points">
                        <li><strong>Premium Origin:</strong> Cultivated in the fertile valleys of Kashmir.</li>
                        <li><strong>100% Organic:</strong> Handpicked without any artificial polish.</li>
                        <li><strong>Health First:</strong> Packed with essential nutrients and minerals.</li>
                        <li><strong>Direct to Home:</strong> Sourced straight from local farmers.</li>
                    </ul>

                    {relatedVariants.length > 0 && (
                        <div className="variant-selector-container" style={{ marginTop: '20px' }}>
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
                </div>

                {/* 3. Sticky Buy Box */}
                <div className="sticky-buy-box">
                    <div className="buy-box-price">₹{product.price}</div>

                    <div className="delivery-info">
                        <span className="free">FREE Delivery</span> <span className="delivery-date">{new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}.</span>
                    </div>

                    <div className="in-stock">In Stock.</div>

                    <div style={{ marginTop: '5px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#565959', marginBottom: '8px' }}>
                            Check Delivery Availability
                        </div>
                        <div className="pincode-checker">
                            <input
                                type="text"
                                placeholder="Enter Pincode"
                                className="pincode-input"
                                maxLength="6"
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value)}
                            />
                            <button className="pincode-btn" onClick={checkPincode}>Check</button>
                        </div>
                        {pincodeStatus && <div className="pincode-status" style={{ color: pincodeStatus.includes('Invalid') ? '#CC0C39' : '#007600', marginTop: '5px' }}>{pincodeStatus}</div>}
                    </div>

                    <div style={{ marginTop: '10px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#565959', marginBottom: '8px' }}>Quantity:</div>
                        <div className="quantity-selector">
                            <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                            <span className="qty-display">{quantity}</span>
                            <button className="qty-btn" onClick={() => setQuantity(q => q + 1)}>+</button>
                        </div>
                    </div>

                    <div className="action-buttons-group">
                        <button onClick={handleAddToCart} className="btn-premium" style={{ width: '100%', borderRadius: '50px' }}>
                            Add to Cart
                        </button>
                        <button onClick={handleBuyNow} className="btn-secondary" style={{ width: '100%', borderRadius: '50px', background: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' }}>
                            Buy Now
                        </button>
                    </div>

                    <div className="secure-transaction">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        Secure transaction
                    </div>

                    <div className="ships-from">
                        <span>Ships from</span>
                        <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>Nature's Pledge</span>
                        <span>Sold by</span>
                        <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>Kashmiri Farmers Collab</span>
                    </div>
                </div>
            </div>

            {/* Tabbed Info Section (Amazon style details block) */}
            <div className="product-tabs-container">
                <div className="tabs-header">
                    <button className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>Description</button>
                    <button className={`tab-btn ${activeTab === 'story' ? 'active' : ''}`} onClick={() => setActiveTab('story')}>Farm Story</button>
                    <button className={`tab-btn ${activeTab === 'benefits' ? 'active' : ''}`} onClick={() => setActiveTab('benefits')}>Health Benefits</button>
                </div>

                <div className="tab-content">
                    {activeTab === 'description' && (
                        <div className="animate-slide-up">
                            <h3>About this Item</h3>
                            <p>{product.description}</p>
                        </div>
                    )}
                    {activeTab === 'story' && (
                        <div className="animate-slide-up">
                            <h3>From the Valleys of Kashmir</h3>
                            <p>{product.origin_story || "Cultivated in the pristine valleys of Kashmir, fed by glacial waters and pure mountain air."}</p>
                            <h3 style={{ marginTop: '20px' }}>Our Farmer's Promise</h3>
                            <p>{product.farm_story || "Hand-harvested by local artisans using generational wisdom, ensuring absolute purity."}</p>
                        </div>
                    )}
                    {activeTab === 'benefits' && (
                        <div className="animate-slide-up">
                            <h3>Nourishing Benefits</h3>
                            <ul className="amazon-bullet-points">
                                {product.health_benefits ? product.health_benefits.map((b, i) => <li key={i}>{b}</li>) : <li>Pure & Organic Nutritional profile.</li>}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Original Reviews Section */}
            <div id="reviews-section" className="reviews-section">
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
                <div className="section-padding" style={{ borderTop: '1px solid rgba(0,0,0,0.05)', marginTop: '40px' }}>
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
