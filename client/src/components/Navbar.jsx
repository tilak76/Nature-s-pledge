import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { cart } = useCart();
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="container nav-content">
                <Link to="/" className="logo">Nature Pledge</Link>
                <div className="mobile-menu-icon" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? '✕' : '☰'}
                </div>
                <div className={`nav-links ${isOpen ? 'active' : ''}`}>
                    <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
                    <Link to="/shop" onClick={() => setIsOpen(false)}>Shop</Link>

                    {user ? (
                        <>
                            <Link to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link>
                            <span onClick={handleLogout} style={{ cursor: 'pointer', marginLeft: '1rem', fontWeight: '500', color: '#5D4037' }}>Logout</span>
                        </>
                    ) : (
                        <Link to="/login" onClick={() => setIsOpen(false)}>Login</Link>
                    )}

                    <Link to="/cart" className="cart-icon" onClick={() => setIsOpen(false)}>Cart ({cartCount})</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
