import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <div className="hero-logo-container">
                        <img src="/logo_main.jpg" alt="Nature's Pledge Logo" className="hero-logo" />
                    </div>
                    <h1>Nature's Pledge</h1>
                    <p>
                        Authentic Kashmir Dry Fruits & Organic Staples.
                    </p>
                    <Link to="/shop" className="btn-premium">Shop Now</Link>
                </div>
            </section>

            {/* Featured Categories */}
            <section className="featured-section section-padding">
                <div className="container">
                    <h2 className="section-title">Our Premium Collection</h2>
                    <div className="features-grid">
                        <div className="feature-card" onClick={() => navigate('/product/1')}>
                            <img src="/kashmiri_almond_proper.jpg" alt="Kashmiri Almond" />
                            <h3>Kashmiri Almond</h3>
                            <p>Rich in oil, naturally sweet. <br /><span className="desi-font">Asli Kashmiri Mamra, sehat ka khazana.</span></p>
                        </div>
                        <div className="feature-card" onClick={() => navigate('/product/6')}>
                            <img src="/kashmiri_walnut_real.png" alt="Kashmiri Premium Walnut" />
                            <h3>Kashmiri Premium Walnut</h3>
                            <p>Snow-white kernels, easy to break. <br /><span className="desi-font">Haath se todiye, taazgi mehsoos kijiye.</span></p>
                        </div>
                        <div className="feature-card" onClick={() => navigate('/product/3')}>
                            <img src="/rajma_royal_real.jpg" alt="Rajma Royal" />
                            <h3>Rajma Royal</h3>
                            <p>Perfect texture, distinct flavor. <br /><span className="desi-font">Wohi purana swaad, jo muh mein ghul jaye.</span></p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="values-section section-padding">
                <div className="container">
                    <h2 className="section-title">The Promise</h2>
                    <div className="values-grid">
                        <div className="value-item">
                            <span className="icon">🏡</span>
                            <h3>Family Feeling</h3>
                            <p>For us, you are not just a customer. <br /><span className="desi-font">Humare liye aap parivaar hain.</span></p>
                        </div>
                        <div className="value-item">
                            <span className="icon">🌿</span>
                            <h3>100% Pure & Organic</h3>
                            <p>No polish, no artificial shine. <br /><span className="desi-font">Bilkul waise, jaise khet se nikla ho.</span></p>
                        </div>
                        <div className="value-item">
                            <span className="icon">🤝</span>
                            <h3>Direct from Farmers</h3>
                            <p>Sourced directly from orchards. <br /><span className="desi-font">Kisan ki mehnat, seedha aap tak.</span></p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
