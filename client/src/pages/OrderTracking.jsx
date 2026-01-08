import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const OrderTracking = () => {
    const [searchParams] = useSearchParams();
    const { showToast } = useToast();

    // State
    const [orderIdInput, setOrderIdInput] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);

    // Auto-search if ID is in URL
    useEffect(() => {
        const urlId = searchParams.get('id');
        if (urlId) {
            setOrderIdInput(urlId);
            handleSearch(urlId);
        }
    }, [searchParams]);

    const handleSearch = (idToSearch) => {
        const id = idToSearch || orderIdInput;
        if (!id) {
            showToast('Please enter an Order ID', 'error');
            return;
        }

        setLoading(true);

        // Simulate Network Search
        setTimeout(() => {
            try {
                const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
                const foundOrder = allOrders.find(o => o.id.toLowerCase() === id.toLowerCase());

                if (foundOrder) {
                    setOrder(foundOrder);
                    showToast('Order Found! 🚚');
                } else {
                    setOrder(null);
                    showToast('Order ID not found.', 'error');
                }
            } catch (error) {
                console.error("Search Error", error);
                showToast('Error searching for order', 'error');
            }
            setLoading(false);
        }, 800);
    };

    // Calculate Progress for Timeline
    const getStepStatus = (stepName) => {
        if (!order) return false;
        // Simple logic: if 'Processing', step 1 is done. 
        // For simulation, we'll assume a fixed progression based on time elapsed since order
        // In real app, this comes from DB 'updates' array
        return true;
    };

    return (
        <div className="container" style={{ padding: '3rem 0', minHeight: '80vh' }}>

            {/* Search Section */}
            <div style={{ maxWidth: '600px', margin: '0 auto 3rem', textAlign: 'center' }}>
                <h1 style={{ color: '#3E2723', marginBottom: '1rem' }}>Track Your Delivery 📦</h1>
                <p style={{ color: '#666', marginBottom: '2rem' }}>Enter your Order ID to see real-time updates.</p>

                <div style={{ display: 'flex', gap: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: '10px', background: 'white', borderRadius: '50px' }}>
                    <input
                        type="text"
                        placeholder="e.g. ORD-829102"
                        value={orderIdInput}
                        onChange={(e) => setOrderIdInput(e.target.value)}
                        style={{ flex: 1, border: 'none', padding: '15px 20px', fontSize: '1.1rem', outline: 'none', borderRadius: '50px' }}
                    />
                    <button
                        onClick={() => handleSearch()}
                        disabled={loading}
                        style={{ padding: '15px 35px', background: '#5D4037', color: 'white', border: 'none', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Searching...' : 'Track'}
                    </button>
                </div>
            </div>

            {/* Results Section */}
            {order ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start', animation: 'fadeIn 0.5s ease' }}>

                    {/* Dynamic Map - Points to ACTUAL City */}
                    <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', height: '500px', position: 'relative', border: '1px solid #ddd', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                        <div style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 10, background: 'white', padding: '8px 15px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                            📍 Destination: {order.shipping?.city || 'India'}
                        </div>

                        <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            style={{ border: 0 }}
                            // Google Maps Embed Trick: points to the shipping address city
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(order.shipping?.address + ', ' + order.shipping?.city)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                            allowFullScreen
                        ></iframe>
                    </div>

                    {/* Order Details & Timeline */}
                    <div>
                        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                                <div>
                                    <h2 style={{ margin: 0, color: '#5D4037' }}>{order.id}</h2>
                                    <div style={{ color: '#888', fontSize: '0.9rem' }}>Placed on {new Date(order.date).toLocaleDateString()}</div>
                                </div>
                                <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold' }}>
                                    {order.status}
                                </div>
                            </div>

                            {/* Order Items Summary */}
                            <div style={{ marginBottom: '30px' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>Shipment Contents</h4>
                                {order.items.slice(0, 2).map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.95rem' }}>
                                        <span>{item.quantity}x {item.name}</span>
                                        <span style={{ fontWeight: 'bold' }}>₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                                {order.items.length > 2 && <div style={{ color: '#888', fontStyle: 'italic' }}>+ {order.items.length - 2} more items...</div>}
                                <div style={{ borderTop: '1px dashed #ddd', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                    <span>Total Value</span>
                                    <span>₹{order.total}</span>
                                </div>
                            </div>

                            {/* Modern Timeline */}
                            <h4 style={{ margin: '0 0 15px 0', color: '#555' }}>Delivery Progress</h4>
                            <div style={{ position: 'relative', paddingLeft: '20px' }}>
                                <div style={{ position: 'absolute', left: '7px', top: '5px', bottom: '0', width: '2px', background: '#eee' }}></div>

                                {order.updates ? order.updates.map((update, idx) => (
                                    <div key={idx} style={{ position: 'relative', marginBottom: '25px', paddingLeft: '20px' }}>
                                        <div style={{
                                            position: 'absolute', left: '-20px', top: '0', width: '16px', height: '16px', borderRadius: '50%',
                                            background: update.completed ? '#4CAF50' : '#ddd',
                                            border: '3px solid white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                        }}></div>
                                        <div style={{ fontWeight: update.completed ? 'bold' : 'normal', color: update.completed ? '#333' : '#999' }}>
                                            {update.status}
                                        </div>
                                        {update.completed && <div style={{ fontSize: '0.8rem', color: '#888' }}>{update.time}</div>}
                                    </div>
                                )) : (
                                    <div>Loading timeline...</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Empty State / Instructions
                !loading && (
                    <div style={{ textAlign: 'center', marginTop: '4rem', opacity: 0.6 }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
                        <p>Enter your Order ID above to start tracking.</p>
                        <p style={{ fontSize: '0.9rem' }}>Check your Dashboard or Confirmation Toast for ID.</p>
                    </div>
                )
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @media (max-width: 768px) {
                    div[style*="grid-template-columns: 1fr 1fr"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default OrderTracking;
