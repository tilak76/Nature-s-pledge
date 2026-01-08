import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={{ background: '#172337', color: 'white', padding: '55px 0', fontSize: '12px', marginTop: 'auto', fontFamily: 'Arial, sans-serif' }}>
            <div className="container" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>

                {/* Left Section - Links */}
                <div style={{ display: 'flex', gap: '40px', flex: '2', minWidth: '300px' }}>

                    {/* ABOUT */}
                    <div>
                        <h4 style={{ color: '#878787', fontSize: '12px', marginBottom: '10px', textTransform: 'uppercase', fontWeight: '400' }}>ABOUT</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: '2' }}>
                            <li><Link to="/contact" style={{ color: 'white', textDecoration: 'none' }}>Contact Us</Link></li>
                            <li><Link to="/about" style={{ color: 'white', textDecoration: 'none' }}>About Us</Link></li>
                            <li><Link to="/careers" style={{ color: 'white', textDecoration: 'none' }}>Careers</Link></li>
                            <li><Link to="/stories" style={{ color: 'white', textDecoration: 'none' }}>Press</Link></li>
                        </ul>
                    </div>

                    {/* HELP */}
                    <div>
                        <h4 style={{ color: '#878787', fontSize: '12px', marginBottom: '10px', textTransform: 'uppercase', fontWeight: '400' }}>HELP</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: '2' }}>
                            <li><Link to="/payments" style={{ color: 'white', textDecoration: 'none' }}>Payments</Link></li>
                            <li><Link to="/shipping" style={{ color: 'white', textDecoration: 'none' }}>Shipping</Link></li>
                            <li><Link to="/returns" style={{ color: 'white', textDecoration: 'none' }}>Cancellation & Returns</Link></li>
                            <li><Link to="/faq" style={{ color: 'white', textDecoration: 'none' }}>FAQ</Link></li>
                        </ul>
                    </div>

                    {/* CONSUMER POLICY */}
                    <div>
                        <h4 style={{ color: '#878787', fontSize: '12px', marginBottom: '10px', textTransform: 'uppercase', fontWeight: '400' }}>CONSUMER POLICY</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: '2' }}>
                            <li><Link to="/returns" style={{ color: 'white', textDecoration: 'none' }}>Cancellation & Returns</Link></li>
                            <li><Link to="/terms" style={{ color: 'white', textDecoration: 'none' }}>Terms Of Use</Link></li>
                            <li><Link to="/security" style={{ color: 'white', textDecoration: 'none' }}>Security</Link></li>
                            <li><Link to="/privacy" style={{ color: 'white', textDecoration: 'none' }}>Privacy</Link></li>
                            <li><Link to="/sitemap" style={{ color: 'white', textDecoration: 'none' }}>Sitemap</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Vertical Divider */}
                <div style={{ width: '1px', background: '#454d5e', margin: '0 10px', display: 'none' }} className="footer-divider"></div>

                {/* Right Section - Address & Social */}
                <div style={{ display: 'flex', gap: '40px', flex: '2', minWidth: '300px' }}>

                    {/* Mail Us */}
                    <div style={{ flex: 1, paddingRight: '20px', borderRight: '1px solid #454d5e' }}>
                        <h4 style={{ color: '#878787', fontSize: '12px', marginBottom: '10px', textTransform: 'uppercase', fontWeight: '400' }}>Mail Us:</h4>
                        <p style={{ lineHeight: '1.5', color: 'white' }}>
                            Nature Pledge Private Limited,<br />
                            123, Organic Valley,<br />
                            Kashmir Orchards, Srinagar,<br />
                            Jammu & Kashmir, 190001,<br />
                            India
                        </p>
                    </div>

                    {/* Registered Office */}
                    <div style={{ flex: 1 }}>
                        <h4 style={{ color: '#878787', fontSize: '12px', marginBottom: '10px', textTransform: 'uppercase', fontWeight: '400' }}>Registered Office Address:</h4>
                        <p style={{ lineHeight: '1.5', color: 'white', marginBottom: '1rem' }}>
                            Nature Pledge Private Limited,<br />
                            Orchard Heights, Main Road,<br />
                            Srinagar, Jammu & Kashmir,<br />
                            India - 190001
                        </p>
                        <p style={{ color: 'white' }}>CIN : U51109JK2024PTC123456</p>
                        <p style={{ color: 'white' }}>Telephone: <span style={{ color: '#2874f0' }}>044-45614700</span></p>
                    </div>
                </div>
            </div>

            {/* Bottom Bar: Social & Payment */}
            <div className="container" style={{ maxWidth: '1200px', margin: '30px auto 0', padding: '25px 20px 0', borderTop: '1px solid #454d5e', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginRight: '20px' }}>
                        <span style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFE500" stroke="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path></svg>
                            Advertise
                        </span>
                        <span style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFE500" stroke="none"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2" stroke="#000" strokeWidth="2"></path></svg>
                            Gift Cards
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: 'white' }}>© {new Date().getFullYear()} Nature Pledge</span>
                    <img src="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/payment-method-c454fb.svg" alt="Payment Methods" style={{ height: '15px' }} />
                </div>
            </div>

            <style>{`
                footer a:hover {
                    text-decoration: underline !important;
                }
                @media (min-width: 992px) {
                    .footer-divider { display: block !important; }
                }
            `}</style>
        </footer>
    );
};

export default Footer;
