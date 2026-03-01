import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Checkout = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const { user, updateUser, logActivity } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('razorpay'); // Default to Razorpay
    const [shipping, setShipping] = useState({
        fullName: user?.name || '',
        email: user?.email || '',
        address: '',
        city: '',
        pincode: '',
        phone: '',
        notes: ''
    });

    const [processing, setProcessing] = useState(false);

    // Safety: ensure cart exists
    const safeCart = Array.isArray(cart) ? cart : [];
    const deliveryFee = 50;
    const actualTotal = cartTotal + deliveryFee;

    useEffect(() => {
        if (safeCart.length === 0) {
            // Optional: Redirect
        }
    }, [safeCart]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShipping(prev => ({ ...prev, [name]: value }));
    };

    const handleRazorpayPayment = async () => {
        setProcessing(true);
        try {
            // STEP 1: Create Order on the Server
            const { data: orderData } = await axios.post('/api/payment/orders', {
                amount: actualTotal,
                currency: 'INR'
            });

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_SLrKQbMoIy3lUS",
                amount: orderData.amount, // Already in paise from server if you wish, or use cartTotal*100
                currency: orderData.currency,
                name: "Nature's Pledge",
                description: "Premium Organic Products",
                image: "https://via.placeholder.com/150",
                order_id: orderData.id, // CRITICAL: This links to server-side order
                handler: function (response) {
                    if (response.razorpay_payment_id) {
                        finalizeOrder(response.razorpay_payment_id);
                    } else {
                        showToast('Payment processing failed. No ID returned.', 'error');
                        setProcessing(false);
                    }
                },
                prefill: {
                    name: shipping.fullName,
                    email: user?.email || "customer@example.com",
                    contact: shipping.phone
                },
                theme: {
                    color: "#5D4037"
                },
                modal: {
                    ondismiss: function () {
                        setProcessing(false);
                        showToast('Payment Cancelled by user', 'info');
                    }
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                setProcessing(false);
                showToast(response.error.description || 'Payment Failed', 'error');
            });
            rzp1.open();

        } catch (err) {
            console.error("Razorpay Setup Error:", err);
            showToast('Razorpay failed to initiate. Please check your internet or keys.', 'error');
            setProcessing(false);
        }
    };



    const finalizeOrder = async (paymentId) => {
        const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
        const trackingNumber = 'EU' + Math.floor(100000000 + Math.random() * 900000000) + 'IN';

        const newOrder = {
            id: orderId,
            trackingNumber: trackingNumber,
            date: new Date().toISOString(),
            status: 'Processing',
            items: safeCart,
            total: actualTotal,
            paymentMethod: paymentMethod,
            transactionId: paymentId || 'COD', // Save transaction ID
            shipping: shipping,
            notes: shipping.notes,
            updates: [
                { status: 'Order Placed', location: 'Online', time: new Date().toLocaleTimeString(), completed: true },
                { status: 'Packed', location: 'Nature Pledge Facility', time: 'Pending', completed: false },
                { status: 'Dispatched', location: 'New Delhi NSH', time: 'Pending', completed: false },
                { status: 'Out for Delivery', location: shipping.city + ' SO', time: 'Pending', completed: false }
            ]
        };

        try {
            const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
            existingOrders.unshift(newOrder);
            localStorage.setItem('orders', JSON.stringify(existingOrders));

            // ALSO SEND TO SERVER
            const serverOrder = {
                ...newOrder,
                customer: {
                    name: shipping.fullName,
                    phone: shipping.phone,
                    city: shipping.city,
                    address: shipping.address,
                    pincode: shipping.pincode,
                    email: user?.email || shipping.email || 'Guest'
                }
            };

            const serverResponse = await axios.post('/api/orders', serverOrder);
            if (!serverResponse.data) throw new Error("Server rejected order");

            if (paymentMethod === 'wallet' && user) {
                // If user object has walletBalance, subtract the total
                updateUser({ walletBalance: user.walletBalance - actualTotal });
            }

            logActivity('Placed Order', { amount: actualTotal, orderId: orderId });

        } catch (e) {
            console.error("Order completion failed:", e);
            showToast('Failed to connect to server. Check your network.', 'error');
            setProcessing(false);
            return;
        }

        setTimeout(() => {
            showToast(`Order Placed Successfully!`);
            clearCart();
            setProcessing(false);
            navigate(`/track-order?id=${orderId}`);
        }, 800);
    };

    const handlePlaceOrder = () => {
        if (processing) return;

        // Validation for Address
        if (!shipping.fullName || !shipping.address || !shipping.city || !shipping.pincode || !shipping.phone) {
            showToast('Please fill in all shipping details', 'error');
            setStep(1);
            return;
        }

        setProcessing(true);

        if (paymentMethod === 'razorpay') {
            // Trigger Razorpay
            if (window.Razorpay) {
                handleRazorpayPayment();
            } else {
                showToast('Razorpay SDK failed to load. Please reload page.', 'error');
                setProcessing(false);
            }
        } else if (paymentMethod === 'wallet') {
            if (user && (user.walletBalance || 0) < actualTotal) {
                showToast('Insufficient wallet balance!', 'error');
                setProcessing(false);
                return;
            }
            finalizeOrder('WALLET-' + Date.now());
        } else {
            // COD
            finalizeOrder(null);
        }
    };

    if (safeCart.length === 0) {
        return (
            <div className="container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
                <h2>Your Cart is Empty</h2>
                <button onClick={() => navigate('/shop')} style={{ marginTop: '20px', padding: '10px 20px', background: '#FFD814', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>Start Shopping</button>
            </div>
        );
    }

    return (
        <div className="container checkout-page" style={{ padding: '2rem 1rem', maxWidth: '1000px', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ fontWeight: '400', fontSize: '1.8rem', marginBottom: '1rem' }}>Checkout</h1>

            <div className="checkout-container">
                {/* Left Column: Flow */}
                <div style={{ flex: 1 }}>

                    {/* Step 1: Address */}
                    <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem', background: 'white' }}>
                        <div style={{ background: step === 1 ? 'white' : '#f7f7f7', padding: '15px 20px', borderBottom: '1px solid #ddd', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: step === 1 ? '#e77600' : '#333' }}>1. Delivery Address</span>
                            {step > 1 && <button onClick={() => setStep(1)} style={{ color: '#007185', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Change</button>}
                        </div>

                        {step === 1 && (
                            <div style={{ padding: '20px' }}>
                                <form style={{ display: 'grid', gap: '15px' }} onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div>
                                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Full Name</label>
                                            <input required name="fullName" value={shipping.fullName} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #888' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Email Address</label>
                                            <input required type="email" name="email" value={shipping.email} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #888' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Address</label>
                                        <input required name="address" value={shipping.address} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #888' }} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div>
                                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>City</label>
                                            <input required name="city" value={shipping.city} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #888' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Pincode</label>
                                            <input
                                                required
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                name="pincode"
                                                value={shipping.pincode}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '');
                                                    if (value.length <= 6) {
                                                        setShipping(prev => ({ ...prev, pincode: value }));
                                                    }
                                                }}
                                                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #888' }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Phone Number</label>
                                        <input required name="phone" value={shipping.phone} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #888' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Special Instructions / Delivery Notes (Optional)</label>
                                        <textarea name="notes" value={shipping.notes} onChange={handleInputChange} placeholder="E.g. Call before delivery, leave at door, etc." style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #888', minHeight: '60px' }} />
                                    </div>

                                    <button type="submit" style={{ background: '#FFD814', border: '1px solid #FCD200', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', marginTop: '10px', justifySelf: 'start', boxShadow: '0 2px 5px rgba(213,217,217,0.5)' }}>Use this address</button>
                                </form>
                            </div>
                        )}
                        {step > 1 && (
                            <div style={{ padding: '15px 20px', fontSize: '0.9rem', color: '#555' }}>
                                <b>{shipping.fullName}</b>, {shipping.address}, {shipping.city}, {shipping.pincode}
                            </div>
                        )}
                    </div>

                    {/* Step 2: Payment */}
                    <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem', background: 'white' }}>
                        <div style={{ background: step === 2 ? 'white' : '#f7f7f7', padding: '15px 20px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>
                            <span style={{ color: step === 2 ? '#e77600' : '#333' }}>2. Select a payment method</span>
                        </div>

                        {step === 2 && (
                            <div style={{ padding: '20px' }}>

                                {/* Razorpay Option */}
                                <div style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '15px', marginBottom: '10px', background: paymentMethod === 'razorpay' ? '#fcf5ee' : 'white' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                        <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={(e) => setPaymentMethod(e.target.value)} />
                                        <span style={{ fontWeight: 'bold', color: '#002f34' }}>Razorpay Secure (Cards, UPI, NetBanking)</span>
                                    </label>
                                    {paymentMethod === 'razorpay' && <div style={{ marginLeft: '25px', fontSize: '0.85rem', color: '#666', marginTop: '5px' }}>Pay securely with Credit/Debit Cards, UPI, or NetBanking handled by Razorpay.</div>}
                                </div>

                                <div style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '15px', marginBottom: '10px', background: paymentMethod === 'cod' ? '#fcf5ee' : 'white' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                        <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} />
                                        <span style={{ fontWeight: 'bold' }}>Cash on Delivery</span>
                                    </label>
                                </div>

                                {user && (
                                    <div style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '15px', marginBottom: '10px', background: paymentMethod === 'wallet' ? '#fcf5ee' : 'white' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                            <input type="radio" name="payment" value="wallet" checked={paymentMethod === 'wallet'} onChange={(e) => setPaymentMethod(e.target.value)} disabled={(user.walletBalance || 0) < actualTotal} />
                                            <span style={{ fontWeight: 'bold' }}>Nature Pledge Wallet (Bal: ₹{user.walletBalance || 0})</span>
                                        </label>
                                        {(user.walletBalance || 0) < actualTotal && <div style={{ color: 'red', marginLeft: '25px', fontSize: '0.8rem' }}>Insufficient balance</div>}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Summary */}
                <div className="checkout-summary" style={{ width: '300px', flexShrink: 0 }}>
                    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', background: 'white', position: 'sticky', top: '90px' }}>
                        <button
                            onClick={handlePlaceOrder}
                            disabled={step !== 2 || processing}
                            style={{
                                width: '100%',
                                padding: '10px',
                                background: step === 2 ? '#FFD814' : '#e7e7e7',
                                border: step === 2 ? '1px solid #FCD200' : '1px solid #ddd',
                                borderRadius: '20px',
                                cursor: step === 2 ? 'pointer' : 'not-allowed',
                                marginBottom: '15px',
                                boxShadow: '0 2px 5px rgba(213,217,217,0.5)',
                                fontWeight: '500',
                                fontSize: '1rem'
                            }}
                        >
                            {processing ? 'Processing...' : (paymentMethod === 'razorpay' ? 'Proceed to Pay' : 'Place Your Order')}
                        </button>

                        <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px', fontSize: '1.1rem', marginTop: 0 }}>Order Summary</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9rem' }}>
                            <span>Items:</span>
                            <span>₹{cartTotal}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9rem' }}>
                            <span>Delivery:</span>
                            <span style={{ color: '#333' }}>₹50</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', borderTop: '1px solid #ddd', paddingTop: '10px', fontWeight: 'bold', fontSize: '1.2rem', color: '#B12704' }}>
                            <span>Order Total:</span>
                            <span>₹{cartTotal + 50}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#555', marginTop: '15px' }}>
                            By placing your order, you agree to Nature Pledge's <span style={{ color: '#007185', cursor: 'pointer' }}>privacy notice</span> and <span style={{ color: '#007185', cursor: 'pointer' }}>conditions of use</span>.
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .checkout-container {
                    display: flex;
                    gap: 20px;
                }
                @media (max-width: 768px) {
                    .checkout-container {
                        flex-direction: column;
                    }
                    .checkout-summary {
                        width: 100% !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Checkout;
