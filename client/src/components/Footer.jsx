import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={{ background: '#3E2723', color: '#D7CCC8', padding: '4rem 0 2rem', marginTop: 'auto' }}>
            <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>

                {/* Brand Section */}
                <div>
                    <h3 style={{ color: 'white', fontFamily: 'Georgia, serif', fontSize: '1.5rem', marginBottom: '1rem' }}>Nature Pledge</h3>
                    <p style={{ lineHeight: '1.6' }}>
                        Bringing the finest Kashmiri Walnuts straight from the orchards to your home. 100% Organic, Natural, and Premium.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 style={{ color: 'white', marginBottom: '1rem' }}>Quick Links</h4>
                    <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
                        <li><Link to="/" style={{ color: '#D7CCC8', textDecoration: 'none' }}>Home</Link></li>
                        <li><Link to="/shop" style={{ color: '#D7CCC8', textDecoration: 'none' }}>Shop Premium Walnuts</Link></li>
                        <li><Link to="/cart" style={{ color: '#D7CCC8', textDecoration: 'none' }}>My Cart</Link></li>
                        <li><Link to="/admin" style={{ color: '#D7CCC8', textDecoration: 'none' }}>Admin Login</Link></li>
                    </ul>
                </div>

                {/* Contact & Newsletter */}
                <div>
                    <h4 style={{ color: 'white', marginBottom: '1rem' }}>Stay Connected</h4>
                    <p>Subscribe for health tips and exclusive offers.</p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                        <input type="email" placeholder="Email Address" style={{ padding: '8px', borderRadius: '4px', border: 'none', width: '100%' }} />
                        <button style={{ background: '#8D6E63', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Join</button>
                    </div>
                    <div style={{ marginTop: '1.5rem', fontSize: '1.5rem', display: 'flex', gap: '1rem' }}>
                        <span>📷</span>
                        <span>📘</span>
                        <span>🐦</span>
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid #5D4037', fontSize: '0.9rem' }}>
                &copy; {new Date().getFullYear()} Nature Pledge. All rights reserved. | Made with ❤️ for Health.
            </div>
        </footer>
    );
};

export default Footer;
