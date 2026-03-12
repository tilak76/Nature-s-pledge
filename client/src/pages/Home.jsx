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
                    <div className="hero-text-animate">
                        <h1>Nature's Pledge</h1>
                        <p>
                            Authentic Kashmiri Dry Fruits & Organic Staples.
                        </p>
                        <Link to="/shop" className="btn-premium">Explore Collection</Link>
                    </div>
                </div>
            </section>

            {/* Featured Categories */}
            <section className="featured-section section-padding">
                <div className="container">
                    <h2 className="section-title">Kashmiri Dry Fruits & Gems</h2>
                    <div className="features-grid">
                        <div className="feature-card animate-on-scroll" onClick={() => navigate('/product/1')}>
                            <div className="card-img-wrapper">
                                <img src="/kashmiri_almond_proper.jpg" alt="Kashmiri Almond" />
                            </div>
                            <h3>Kashmiri Almond</h3>
                            <p>Rich in oil, naturally sweet. <br /><span className="desi-font">Asli Kashmiri badam, oil se bharpur aur taste mein lajawab.</span></p>
                        </div>
                        <div className="feature-card animate-on-scroll" onClick={() => navigate('/product/6')}>
                            <div className="card-img-wrapper">
                                <img src="/kashmiri_walnut_real.png" alt="Kashmiri Premium Walnut" />
                            </div>
                            <h3>Kashmiri Premium Walnut</h3>
                            <p>Snow-white kernels, easy to break. <br /><span className="desi-font">Ekdum taaza akhrot, jo haath se tediye aur asar dekhiye.</span></p>
                        </div>
                        <div className="feature-card animate-on-scroll" onClick={() => navigate('/product/3')}>
                            <div className="card-img-wrapper">
                                <img src="/rajma_royal_real.jpg" alt="Rajma Royal" />
                            </div>
                            <h3>Rajma Royal</h3>
                            <p>Perfect texture, distinct flavor. <br /><span className="desi-font">Kashmiri Rajma ka wahi purana swaad, jo sabko pasand aaye.</span></p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="values-section section-padding">
                <div className="container">
                    <h2 className="section-title">Hamara Pakka Vaada</h2>
                    <div className="values-grid">
                        <div className="value-item animate-on-scroll">
                            <div className="icon-wrapper">
                                <span className="icon">🏡</span>
                            </div>
                            <h3>Family Like Bond</h3>
                            <p>For us, you are not just a customer. <br /><span className="desi-font">Aap humare liye sirf customer nahi, ek parivaar ki tarah hain.</span></p>
                        </div>
                        <div className="value-item animate-on-scroll">
                            <div className="icon-wrapper">
                                <span className="icon">🌿</span>
                            </div>
                            <h3>100% Pure Organic</h3>
                            <p>No polish, no artificial shine. <br /><span className="desi-font">Sudh kashmiri dry fruits, seedha khet se aapke ghar tak.</span></p>
                        </div>
                        <div className="value-item animate-on-scroll">
                            <div className="icon-wrapper">
                                <span className="icon">🤝</span>
                            </div>
                            <h3>Farmer's Hardwork</h3>
                            <p>Sourced directly from orchards. <br /><span className="desi-font">Kisan ki mehnat aur hamara shuddhata ka pakka vaada.</span></p>
                        </div>
                    </div>
                </div>
            </section>

            {/* New Experience Section */}
            <section className="experience-section section-padding">
                <div className="container">
                    <div className="experience-box glass-effect">
                        <div className="exp-content">
                            <h2>The Taste of Tradition</h2>
                            <p>Discover the rich heritage of Kashmiri agriculture through our carefully curated organic products.</p>
                            <div className="exp-badges">
                                <div className="badge">✓ Chemical Free</div>
                                <div className="badge">✓ Farm Fresh</div>
                                <div className="badge">✓ Purely Organic</div>
                            </div>
                        </div>
                        <div className="exp-image">
                            <img src="/rajma_bhaderwahi_real.jpg" alt="Authentic Kashmiri Rajma" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
