import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // We will create this

const Home = () => {
    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <img src="/logo_main.jpg" alt="Nature's Pledge Logo" className="hero-logo" style={{ width: '120px', height: '120px', borderRadius: '50%', marginBottom: '1.5rem', border: '3px solid white', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }} />
                    <h1>Nature's Pledge</h1>
                    <p style={{ fontSize: '1.4rem', fontWeight: '400', marginBottom: '1rem' }}>
                        Authentic Kashmir Dry Fruits & Organic Staples.
                    </p>
                    <p style={{ fontStyle: 'italic', color: '#f0f0f0', fontSize: '1.1rem' }}>
                        "Shuddhata aisi, jo ghar ki yaad dila de."
                    </p>
                    <Link to="/shop" className="cta-button">Shop Now</Link>
                </div>
            </section>

            {/* Featured Categories */}
            <section className="container featured-section">
                <h2 className="section-title">Our Premium Collection</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <img src="/kashmiri_almond_proper.jpg" alt="Kashmiri Almond" />
                        <h3>Kashmiri Almond</h3>
                        <p>Rich in oil, naturally sweet. <br /><span style={{ color: '#555', fontStyle: 'italic' }}>Asli Kashmiri Mamra, sehat ka khazana.</span></p>
                    </div>
                    <div className="feature-card">
                        <img src="/kashmiri_walnut_real.png" alt="Kashmiri Premium Walnut" />
                        <h3>Kashmiri Premium Walnut</h3>
                        <p>Snow-white kernels, easy to break. <br /><span style={{ color: '#555', fontStyle: 'italic' }}>Haath se todiye, taazgi mehsoos kijiye.</span></p>
                    </div>
                    <div className="feature-card">
                        <img src="/rajma_royal_real.jpg" alt="Rajma Royal" />
                        <h3>Rajma Royal</h3>
                        <p>Perfect texture, distinct flavor. <br /><span style={{ color: '#555', fontStyle: 'italic' }}>Wohi purana swaad, jo muh mein ghul jaye.</span></p>
                    </div>
                    <div className="feature-card">
                        <img src="/rajma_bhaderwahi_real.jpg" alt="Bhaderwahi Rajma Premium" />
                        <h3>Bhaderwahi Rajma Premium</h3>
                        <p>World famous localized variety. <br /><span style={{ color: '#555', fontStyle: 'italic' }}>Chota daana, lekin swaad bemisaal.</span></p>
                    </div>
                    <div className="feature-card">
                        <img src="/anardana_real.png" alt="Anardana Chutney Special" />
                        <h3>Anardana Chutney Special</h3>
                        <p>Tangy & spicy traditional delicacy. <br /><span style={{ color: '#555', fontStyle: 'italic' }}>Chatpata swaad, jo khane ka maza dugna kar de.</span></p>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="values-section">
                <div className="container">
                    <h2 className="section-title">The Nature's Pledge Promise</h2>
                    <div className="values-grid">
                        <div className="value-item">
                            <span className="icon">🏡</span>
                            <h3>Family Feeling</h3>
                            <p>For us, you are not just a customer. <br /><i>Humare liye aap parivaar hain.</i></p>
                        </div>
                        <div className="value-item">
                            <span className="icon">🌿</span>
                            <h3>100% Pure & Organic</h3>
                            <p>No polish, no artificial shine. <br /><i>Bilkul waise, jaise khet se nikla ho.</i></p>
                        </div>
                        <div className="value-item">
                            <span className="icon">🤝</span>
                            <h3>Direct from Farmers</h3>
                            <p>Sourced directly from orchards. <br /><i>Kisan ki mehnat, seedha aap tak.</i></p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
