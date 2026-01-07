import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        info: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        district: '',
        state: '',
        pincode: ''
    });
    const [showQR, setShowQR] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = () => {
        if (!formData.name || !formData.street || !formData.district || !formData.phone || !formData.pincode) {
            alert('Please fill in all shipping details including District and Pin Code.');
            return;
        }
        // Save details to pass to Payment page
        localStorage.setItem('checkoutInfo', JSON.stringify(formData));
        navigate('/payment');
    };

    const confirmPayment = () => {
        // Here you would typically send the order details to the backend
        alert('Order Placed Successfully! We will verify your payment and ship your order.');
        clearCart();
        navigate('/');
    };

    if (cart.length === 0) return <div className="container" style={{ padding: '2rem' }}><h2>Your Cart is Empty</h2></div>;

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h2 style={{ marginBottom: '2rem' }}>Checkout</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>

                {/* Shipping Form */}
                <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginTop: 0 }}>Shipping Details</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input type="text" name="name" placeholder="Full Name" className="search-bar" style={{ margin: 0 }} onChange={handleChange} />
                        <input type="email" name="email" placeholder="Email Address" className="search-bar" style={{ margin: 0 }} onChange={handleChange} />
                        <input type="text" name="phone" placeholder="Phone Number" className="search-bar" style={{ margin: 0 }} onChange={handleChange} />

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input type="text" name="pincode" placeholder="Pin Code" className="search-bar" style={{ margin: 0 }} onChange={handleChange} />
                            <input type="text" name="district" placeholder="District" className="search-bar" style={{ margin: 0 }} onChange={handleChange} />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input type="text" name="city" placeholder="City" className="search-bar" style={{ margin: 0 }} onChange={handleChange} />
                            <input type="text" name="state" placeholder="State" className="search-bar" style={{ margin: 0 }} onChange={handleChange} />
                        </div>
                        <textarea name="street" placeholder="House No, Building, Street Area" className="search-bar" style={{ margin: 0, height: '80px' }} onChange={handleChange}></textarea>
                    </div>
                </div>

                {/* Order Summary & Payment */}
                <div style={{ background: '#fcf4ec', padding: '2rem', borderRadius: '8px', border: '1px solid #e0e0e0', height: 'fit-content' }}>
                    <h3 style={{ marginTop: 0 }}>Order Summary</h3>
                    {cart.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>{item.name} x {item.quantity}</span>
                            <span>₹{item.price * item.quantity}</span>
                        </div>
                    ))}
                    <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #ccc' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold' }}>
                        <span>Total</span>
                        <span>₹{cartTotal}</span>
                    </div>

                    <button
                        onClick={handlePlaceOrder}
                        style={{ width: '100%', marginTop: '1.5rem', padding: '15px', background: '#5D4037', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1.1rem', cursor: 'pointer' }}
                    >
                        Proceed to Secure Payment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
