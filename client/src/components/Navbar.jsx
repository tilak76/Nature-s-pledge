import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const { cart } = useCart();
    const [isOpen, setIsOpen] = useState(false);
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <nav className="navbar">
            <div className="container nav-content">
                <Link to="/" className="logo">Nature Pledge</Link>
                <div className="mobile-menu-icon" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? '✕' : '☰'}
                </div>
                <div className={`nav-links ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                    <Link to="/">Home</Link>
                    <Link to="/shop">Shop</Link>
                    <Link to="/cart" className="cart-icon">Cart ({cartCount})</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
