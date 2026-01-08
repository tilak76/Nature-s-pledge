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
                // Search by Order ID OR Tracking Number
                const foundOrder = allOrders.find(o =>
                    o.id.toLowerCase() === id.toLowerCase() ||
                    (o.trackingNumber && o.trackingNumber.toLowerCase() === id.toLowerCase())
                );

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

    return (
        <div className="container" style={{ padding: '3rem 0', minHeight: '80vh' }}>

            {/* Search Section */}
            <div style={{ maxWidth: '600px', margin: '0 auto 3rem', textAlign: 'center' }}>
                <h1 style={{ color: '#3E2723', marginBottom: '1rem' }}>Track Your Delivery 📦</h1>
                <p style={{ color: '#666', marginBottom: '2rem' }}>Enter your Order ID or Speed Post Number.</p>

                <div style={{ display: 'flex', gap: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: '10px', background: 'white', borderRadius: '50px' }}>
                    <input
                        type="text"
                        placeholder="e.g. ORD-xxxxx or EUxxxxxxIN"
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
                        <div style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 10, background: '#D32F2F', color: 'white', padding: '8px 15px', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* Simple Circle for Logo */}
                            <div style={{ width: '12px', height: '12px', background: 'white', borderRadius: '50%' }}></div>
                            To: {order.shipping?.city || 'India'}
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

                    {/* Speed Post Details & Timeline */}
                    <div>
                        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #D32F2F', paddingBottom: '15px' }}>
                                <div>
                                    <h4 style={{ margin: 0, color: '#D32F2F' }}>INDIA POST (SPEED POST)</h4>
                                    <div style={{ color: '#333', fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '1px' }}>{order.trackingNumber || 'Processing...'}</div>
                                    <div style={{ color: '#888', fontSize: '0.8rem' }}>Order ID: {order.id}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>Booked On</div>
                                    <div style={{ fontWeight: 'bold' }}>{new Date(order.date).toLocaleDateString()}</div>
                                </div>
                            </div>

                            {/* Tracking Timeline */}
                            <h4 style={{ margin: '0 0 15px 0', color: '#555' }}>Tracking Events</h4>
                            <div style={{ position: 'relative', paddingLeft: '20px', borderLeft: '2px solid #eee', marginLeft: '10px' }}>

                                {order.updates ? order.updates.map((update, idx) => (
                                    <div key={idx} style={{ position: 'relative', marginBottom: '25px', paddingLeft: '20px' }}>
                                        <div style={{
                                            position: 'absolute', left: '-29px', top: '0', width: '16px', height: '16px', borderRadius: '50%',
                                            background: update.completed ? '#D32F2F' : '#ddd',
                                            border: '3px solid white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                        }}></div>
                                        <div style={{ fontWeight: update.completed ? 'bold' : 'normal', color: update.completed ? '#333' : '#999' }}>
                                            {update.status}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#555' }}>
                                            {update.location || 'In Transit'}
                                        </div>
                                        {update.completed && <div style={{ fontSize: '0.8rem', color: '#888' }}>{update.time}</div>}
                                    </div>
                                )) : (
                                    <div>Loading events...</div>
                                )}
                            </div>

                            {/* Official Link */}
                            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                                <a
                                    href="https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ display: 'block', textAlign: 'center', padding: '12px', background: '#D32F2F', color: 'white', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}
                                >
                                    Verify on India Post Website ↗
                                </a>
                                <p style={{ fontSize: '0.8rem', color: '#888', textAlign: 'center', marginTop: '10px' }}>
                                    (Simulation: Use simulated number to test)
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            ) : (
                // Empty State / Instructions
                !loading && (
                    <div style={{ textAlign: 'center', marginTop: '4rem', opacity: 0.6 }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📮</div>
                        <p>Enter your Order ID (ORD-...) or Tracking Number (EU...IN)</p>
                        <p style={{ fontSize: '0.9rem' }}>Check your Dashboard for details.</p>
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
