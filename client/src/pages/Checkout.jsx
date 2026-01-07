import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Checkout = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const { user, updateUser } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [useWallet, setUseWallet] = useState(false);
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
        if (useWallet) {
            if (user.walletBalance >= cartTotal) {
                // Deduct from wallet
                const newBalance = user.walletBalance - cartTotal;
                updateUser({ walletBalance: newBalance });

                showToast('Payment Successful via Wallet! 🎉');
                clearCart();
                navigate('/dashboard'); // Go to orders/dashboard
            } else {
                showToast('Insufficient Wallet Balance', 'error');
            }
        } else {
            // Save details to pass to Payment page (Razorpay)
            localStorage.setItem('checkoutInfo', JSON.stringify(formData));
            navigate('/payment');
        }
    };

    // const confirmPayment = ... (can be removed or kept as backup)

    if (cart.length === 0) return <div className="container" style={{ padding: '2rem' }}><h2>Your Cart is Empty</h2></div>;

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h2 style={{ marginBottom: '2rem' }}>Checkout</h2>
            <div className="checkout-grid">

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

                    {/* Wallet Integration */}
                    {user && (
                        <div style={{ marginTop: '1.5rem', padding: '10px', background: '#fff', borderRadius: '4px', border: '1px solid #ddd' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="checkbox"
                                    checked={useWallet}
                                    onChange={(e) => setUseWallet(e.target.checked)}
                                    disabled={user.walletBalance < cartTotal}
                                />
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>Pay with Wallet</div>
                                    <div style={{ fontSize: '0.9rem', color: '#666' }}>Balance: ₹{user.walletBalance}</div>
                                </div>
                            </div>
                            {user.walletBalance < cartTotal && (
                                <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '5px' }}>Insufficient balance</div>
                            )}
                        </div>
                    )}

                    <button
                        onClick={handlePlaceOrder}
                        style={{ width: '100%', marginTop: '1.5rem', padding: '15px', background: '#5D4037', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1.1rem', cursor: 'pointer' }}
                    >
                        {useWallet ? 'Pay Now with Wallet' : 'Proceed to Secure Payment'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
