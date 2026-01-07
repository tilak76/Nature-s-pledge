import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="home-page">
            <section className="hero">
                <div className="hero-content">
                    <h1>Premium Kashmiri Akhroth</h1>
                    <p>Nature's finest walnuts, delivered straight to your doorstep.</p>
                    <Link to="/shop" className="cta-button">Shop Now</Link>
                </div>
            </section>

            <section className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <h2>Why Choose Our Walnuts?</h2>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ maxWidth: '300px' }}>
                        <h3>100% Natural</h3>
                        <p>Grown organically in the valleys of Kashmir without harmful pesticides.</p>
                    </div>
                    <div style={{ maxWidth: '300px' }}>
                        <h3>Fresh Harvest</h3>
                        <p>Directly sourced from farmers to ensure maximum freshness and taste.</p>
                    </div>
                    <div style={{ maxWidth: '300px' }}>
                        <h3>Premium Quality</h3>
                        <p>Hand-picked walnuts ensuring only the best ones make it to you.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
