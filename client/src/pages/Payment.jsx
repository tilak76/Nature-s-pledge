import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Payment = () => {
    const { cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [timer, setTimer] = useState(600); // 10 minutes

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleRazorpayPayment = async () => {
        const loadScript = (src) => {
            return new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = () => resolve(true);
                script.onerror = () => resolve(false);
                document.body.appendChild(script);
            });
        };

        const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
        if (!res) {
            alert('Razorpay SDK failed to load.');
            return;
        }

        // CLIENT-SIDE INTEGRATION
        const options = {
            key: 'rzp_live_S0W61ZvJ61G4Ec', // LIVE KEY from User
            amount: cartTotal * 100,
            currency: 'INR',
            name: 'Nature Pledge',
            description: 'Order Payment',
            image: '/payment-qr.jpg',
            // No order_id needed for this simple mode
            handler: function (response) {
                handleSuccess(response.razorpay_payment_id);
            },
            prefill: {
                name: 'Nature Pledge Customer',
                email: 'customer@example.com',
                contact: '9999999999',
            },
            theme: {
                color: '#5D4037',
            },
        };

        try {
            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

            // Handle error in opening (e.g. invalid key)
            paymentObject.on('payment.failed', function (response) {
                alert("Payment Failed: " + response.error.description);
            });
        } catch (err) {
            console.error(err);
            alert("Could not open Razorpay. Check your API Key.");
        }
    };

    const handleSuccess = (txnId) => {
        // Save Order Function
        const orderData = {
            id: Date.now(),
            date: new Date().toISOString(),
            customer: JSON.parse(localStorage.getItem('checkoutInfo') || '{}'),
            items: JSON.parse(localStorage.getItem('cart') || '[]'),
            total: cartTotal,
            paymentMethod: 'Razorpay (UPI/Card)',
            transactionId: txnId,
            status: 'Paid'
        };

        const existingOrders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
        existingOrders.unshift(orderData);
        localStorage.setItem('admin_orders', JSON.stringify(existingOrders));

        alert(`Payment Successful! Transaction ID: ${txnId}`);
        clearCart();
        localStorage.removeItem('checkoutInfo');
        navigate('/');
    };

    return (
        <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '1rem', fontFamily: 'sans-serif', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: '500px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', overflow: 'hidden' }}>

                {/* Header */}
                <div style={{ background: '#5D4037', padding: '1.5rem', color: 'white', textAlign: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Secure Checkout</h2>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '5px' }}>Nature Pledge Store</div>
                </div>

                <div style={{ padding: '2rem' }}>

                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <p style={{ color: '#666', marginBottom: '5px' }}>Total Amount</p>
                        <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#333' }}>₹ {cartTotal}</h1>
                        <div style={{ fontSize: '0.8rem', color: '#d32f2f', marginTop: '10px', fontWeight: 'bold' }}>
                            Expires in {formatTime(timer)}
                        </div>
                    </div>

                    <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <span style={{ fontSize: '1.2rem' }}>📱</span>
                            <strong>UPI Apps</strong>
                            <span style={{ fontSize: '0.8rem', color: '#666' }}>(GPay, PhonePe, Paytm)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.2rem' }}>💳</span>
                            <strong>Cards</strong>
                            <span style={{ fontSize: '0.8rem', color: '#666' }}>(Credit / Debit)</span>
                        </div>
                    </div>

                    <button
                        onClick={handleRazorpayPayment}
                        style={{
                            background: '#2e7d32', color: 'white', border: 'none', padding: '18px',
                            borderRadius: '50px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer',
                            width: '100%', boxShadow: '0 4px 15px rgba(46, 125, 50, 0.3)',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
                        }}
                    >
                        <span>Pay Now</span>
                        <span>→</span>
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem', opacity: 0.6, fontSize: '0.8rem' }}>
                        <p>Secured by Razorpay</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
