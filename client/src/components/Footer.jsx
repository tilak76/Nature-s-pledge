import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container footer-grid">

                {/* ABOUT */}
                <div className="footer-column">
                    <h4>ABOUT</h4>
                    <ul>
                        <li><Link to="/contact">Contact Us</Link></li>
                        <li><Link to="/about">About Us</Link></li>
                        <li><Link to="/careers">Careers</Link></li>
                        <li><Link to="/stories">Press</Link></li>
                    </ul>
                </div>

                {/* HELP */}
                <div className="footer-column">
                    <h4>HELP</h4>
                    <ul>
                        <li><Link to="/payments">Payments</Link></li>
                        <li><Link to="/shipping">Shipping</Link></li>
                        <li><Link to="/returns">Returns</Link></li>
                        <li><Link to="/faq">FAQ</Link></li>
                    </ul>
                </div>

                {/* POLICY */}
                <div className="footer-column">
                    <h4>POLICY</h4>
                    <ul>
                        <li><Link to="/terms">Terms Of Use</Link></li>
                        <li><Link to="/security">Security</Link></li>
                        <li><Link to="/privacy">Privacy</Link></li>
                        <li><Link to="/sitemap">Sitemap</Link></li>
                    </ul>
                </div>

                {/* ADDRESS */}
                <div className="footer-column footer-address">
                    <h4>MAIL US</h4>
                    <p>
                        Jagdamby Gen. Store,<br />
                        District Udhampur, J&K<br />
                        Pin - 182125
                    </p>
                    <p style={{ marginTop: '10px' }}>
                        <strong>Reg:</strong> 0282010100000104<br />
                        <strong>Tel:</strong> 044-45614700
                    </p>
                </div>
            </div>

            <div className="container footer-bottom">
                <div className="footer-socials">
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    </a>
                </div>

                <div className="footer-copy">
                    © {new Date().getFullYear()} Nature's Pledge. Crafted with Care.
                </div>

                <img src="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/payment-method-c454fb.svg" alt="Payments" className="payment-methods" style={{ height: '15px' }} />
            </div>
        </footer>
    );
};

export default Footer;
