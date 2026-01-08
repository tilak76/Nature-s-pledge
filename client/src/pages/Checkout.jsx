import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Checkout = () => {
    const { cart, cartTotal, clearCart, updateQuantity, removeFromCart } = useCart();
    const { user, updateUser } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [shipping, setShipping] = useState({
        fullName: '',
        address: '',
        city: '',
        pincode: '',
        phone: ''
    });
    const [useWallet, setUseWallet] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShipping(prev => ({ ...prev, [name]: value }));
    };

    const handlePlaceOrder = () => {
        // Validation
        if (!shipping.fullName || !shipping.address || !shipping.city || !shipping.pincode || !shipping.phone) {
            showToast('Please fill in all shipping details', 'error');
            return;
        }

        if (cart.length === 0) {
            showToast('Your cart is empty', 'error');
            return;
        }

        let finalAmount = cartTotal;
        let walletDeduction = 0;

        if (useWallet) {
            if (user.walletBalance >= cartTotal) {
                walletDeduction = cartTotal;
                finalAmount = 0;
            } else {
                showToast('Insufficient wallet balance for full payment', 'error');
                return;
            }
        }

        // Simulate Order Placement
        setTimeout(() => {
            if (useWallet && walletDeduction > 0) {
                const newBalance = user.walletBalance - walletDeduction;
                updateUser({ walletBalance: newBalance });
            }

            showToast('Order Placed Successfully! 🎉');
            clearCart();
            navigate('/dashboard'); // Go to orders/dashboard
        }, 1500);
    };

    if (cart.length === 0) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
                <h2>Your Cart is Empty</h2>
                <p style={{ color: '#666', marginBottom: '2rem' }}>Looks like you haven't added anything yet.</p>
                <button
                    onClick={() => navigate('/shop')}
                    style={{ padding: '12px 30px', background: '#5D4037', color: 'white', border: 'none', borderRadius: '50px', fontSize: '1.1rem', cursor: 'pointer' }}
                >
                    Start Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h2 style={{ marginBottom: '2rem' }}>Checkout</h2>
            <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                {/* Shipping Form */}
                <div>
                    <h3 style={{ marginBottom: '1.5rem' }}>Shipping Details</h3>
                    <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }} onSubmit={(e) => e.preventDefault()}>
                        <input name="fullName" placeholder="Full Name" value={shipping.fullName} onChange={handleInputChange} style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ddd' }} />
                        <input name="address" placeholder="Address" value={shipping.address} onChange={handleInputChange} style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ddd' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <input name="city" placeholder="City" value={shipping.city} onChange={handleInputChange} style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ddd' }} />
                            <input name="pincode" placeholder="Pincode" value={shipping.pincode} onChange={handleInputChange} style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ddd' }} />
                        </div>
                        <input name="phone" placeholder="Phone Number" value={shipping.phone} onChange={handleInputChange} style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ddd' }} />
                    </form>
                </div>

                {/* Order Summary & Payment */}
                <div style={{ background: '#fcf4ec', padding: '2rem', borderRadius: '8px', border: '1px solid #e0e0e0', height: 'fit-content' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Order Summary</h3>

                    <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem', paddingRight: '5px' }}>
                        {cart.map(item => (
                            <div key={item.id} style={{ display: 'flex', gap: '15px', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold', color: '#3E2723', marginBottom: '5px' }}>{item.name}</div>
                                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '8px' }}>₹{item.price} / unit</div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '4px', background: 'white' }}>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                                style={{ padding: '5px 10px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#555' }}
                                            >-</button>
                                            <span style={{ padding: '0 5px', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                style={{ padding: '5px 10px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#555' }}
                                            >+</button>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            style={{ background: 'transparent', border: 'none', color: '#e53935', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline' }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                                <div style={{ fontWeight: 'bold' }}>₹{item.price * item.quantity}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', borderTop: '2px solid #3E2723', paddingTop: '1rem' }}>
                        <span>Total Amount</span>
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
