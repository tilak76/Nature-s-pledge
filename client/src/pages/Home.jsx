import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css'; // We will create this

const Home = () => {
    const navigate = useNavigate();
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
                    <div className="feature-card" onClick={() => navigate('/product/1')} style={{ cursor: 'pointer' }}>
                        <img src="/kashmiri_almond_proper.jpg" alt="Kashmiri Almond" />
                        <h3>Kashmiri Almond</h3>
                        <p>Rich in oil, naturally sweet. <br /><span style={{ color: '#555', fontStyle: 'italic' }}>Asli Kashmiri Mamra, sehat ka khazana.</span></p>
                    </div>
                    <div className="feature-card" onClick={() => navigate('/product/6')} style={{ cursor: 'pointer' }}>
                        <img src="/kashmiri_walnut_real.png" alt="Kashmiri Premium Walnut" />
                        <h3>Kashmiri Premium Walnut</h3>
                        <p>Snow-white kernels, easy to break. <br /><span style={{ color: '#555', fontStyle: 'italic' }}>Haath se todiye, taazgi mehsoos kijiye.</span></p>
                    </div>
                    <div className="feature-card" onClick={() => navigate('/product/3')} style={{ cursor: 'pointer' }}>
                        <img src="/rajma_royal_real.jpg" alt="Rajma Royal" />
                        <h3>Rajma Royal</h3>
                        <p>Perfect texture, distinct flavor. <br /><span style={{ color: '#555', fontStyle: 'italic' }}>Wohi purana swaad, jo muh mein ghul jaye.</span></p>
                    </div>
                    <div className="feature-card" onClick={() => navigate('/product/4')} style={{ cursor: 'pointer' }}>
                        <img src="/rajma_bhaderwahi_real.jpg" alt="Bhaderwahi Rajma Premium" />
                        <h3>Bhaderwahi Rajma Premium</h3>
                        <p>World famous localized variety. <br /><span style={{ color: '#555', fontStyle: 'italic' }}>Chota daana, lekin swaad bemisaal.</span></p>
                    </div>
                    <div className="feature-card" onClick={() => navigate('/product/7')} style={{ cursor: 'pointer' }}>
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
                            <p>For us, you are not just a customer. <br /><span className="desi-font" style={{ fontSize: '1.2rem' }}>Humare liye aap parivaar hain.</span></p>
                        </div>
                        <div className="value-item">
                            <span className="icon">🌿</span>
                            <h3>100% Pure & Organic</h3>
                            <p>No polish, no artificial shine. <br /><span className="desi-font" style={{ fontSize: '1.2rem' }}>Bilkul waise, jaise khet se nikla ho.</span></p>
                        </div>
                        <div className="value-item">
                            <span className="icon">🤝</span>
                            <h3>Direct from Farmers</h3>
                            <p>Sourced directly from orchards. <br /><span className="desi-font" style={{ fontSize: '1.2rem' }}>Kisan ki mehnat, seedha aap tak.</span></p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Floating WhatsApp Button */}
            <a href="https://wa.me/919999999999" className="whatsapp-float" target="_blank" rel="noopener noreferrer" title="Chat with us">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="white"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-8.68-2.031-.967-.272-.099-.47-.149-.669.198-.198.347-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
            </a>
        </div>
    );
};

export default Home;
