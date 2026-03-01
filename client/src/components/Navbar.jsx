import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';
import './NavbarLogo.css';

const Navbar = () => {
    const { cart } = useCart();
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    // Default to empty array if cart is undefined to prevent crash
    const currentCart = Array.isArray(cart) ? cart : [];
    const cartCount = currentCart.reduce((acc, item) => acc + (parseInt(item.quantity) || 0), 0);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="container nav-content">
                <Link to="/" className="navbar-logo">
                    <img src="/logo_main.jpg" alt="Nature's Pledge" className="brand-logo" />
                    <span className="brand-name">Nature's Pledge</span>
                </Link>

                {/* Mobile Menu Icon (SVG) */}
                <div className="mobile-menu-icon" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    )}
                </div>

                <div className={`nav-links ${isOpen ? 'active' : ''}`}>
                    <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
                    <Link to="/shop" onClick={() => setIsOpen(false)}>Shop</Link>

                    {/* Add Tracking Link */}
                    <Link to="/track-order" onClick={() => setIsOpen(false)}>Track Order</Link>
                    <a href="#chat" onClick={(e) => { e.preventDefault(); document.querySelector('.chat-toggle')?.click(); }} className="whatsapp-float" title="Live Inquiry Chat" style={{ background: '#5D4037', color: 'white', padding: '6px 15px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                        </svg>
                        Live Help
                    </a>
                    {user && (user.email === 'tilakmishra.76@gmail.com' || user.role === 'admin') && (
                        <Link to="/admin" onClick={() => setIsOpen(false)}>Admin</Link>
                    )}



                    {user ? (
                        <div className="user-nav-action" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                            <Link to="/dashboard" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {user.image ? (
                                    <img src={user.image} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #5D4037' }} />
                                ) : (
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#5D4037', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                                        {user.name?.charAt(0) || 'U'}
                                    </div>
                                )}
                                <span className="user-name-label">{user.name?.split(' ')[0]}</span>
                            </Link>
                            <span onClick={handleLogout} className="logout-btn" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: '#B12704' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                            </span>
                        </div>
                    ) : (
                        <Link to="/login" className="login-nav-btn" onClick={() => setIsOpen(false)} style={{ background: '#5D4037', color: 'white', padding: '8px 20px', borderRadius: '50px' }}>Login</Link>
                    )}

                    <Link to="/cart" className="cart-icon-wrapper" onClick={() => setIsOpen(false)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="mobile-only">Cart</span>
                            <div style={{ position: 'relative' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#5D4037' }}>
                                    <circle cx="9" cy="21" r="1"></circle>
                                    <circle cx="20" cy="21" r="1"></circle>
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                </svg>
                                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
