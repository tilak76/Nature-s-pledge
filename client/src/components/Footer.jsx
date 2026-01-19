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
                            Jagdamby Gen. Store,<br />
                            District Udhampur,<br />
                            Tehsil Panchari,<br />
                            Jammu & Kashmir,<br />
                            Pin - 182125
                        </p>
                    </div>

                    {/* Registered Office */}
                    <div style={{ flex: 1 }}>
                        <h4 style={{ color: '#878787', fontSize: '12px', marginBottom: '10px', textTransform: 'uppercase', fontWeight: '400' }}>Registered Office Address:</h4>
                        <p style={{ lineHeight: '1.5', color: 'white', marginBottom: '1rem' }}>
                            Jagdamby Gen. Store,<br />
                            District Udhampur,<br />
                            Tehsil Panchari,<br />
                            Jammu & Kashmir,<br />
                            Pin - 182125
                        </p>
                        <p style={{ color: 'white' }}>Reg No : 0282010100000104</p>
                        <p style={{ color: 'white' }}>Telephone: <span style={{ color: '#2874f0' }}>044-45614700</span></p>
                    </div>
                </div>
            </div>

            {/* Bottom Bar: Social & Payment */}
            <div className="container" style={{ maxWidth: '1200px', margin: '30px auto 0', padding: '25px 20px 0', borderTop: '1px solid #454d5e', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {/* Social Icons */}
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: 'white', transition: 'color 0.2s' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ color: 'white', transition: 'color 0.2s' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: 'white', transition: 'color 0.2s' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        </a>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: 'white' }}>© {new Date().getFullYear()} Nature's Pledge</span>
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
