import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Admin = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch from LocalStorage (Netlify Mode)
        const savedOrders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
        setOrders(savedOrders);
        setLoading(false);
    }, []);

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading Data...</div>;

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <h2>Admin Dashboard - Received Orders</h2>
            <p>Data stored in: <code>Browser Storage (Netlify Mode)</code></p>

            {orders.length === 0 ? (
                <p>No orders yet.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', background: 'white' }}>
                    <thead>
                        <tr style={{ background: '#5D4037', color: 'white', textAlign: 'left' }}>
                            <th style={{ padding: '12px' }}>Date</th>
                            <th style={{ padding: '12px' }}>Order ID</th>
                            <th style={{ padding: '12px' }}>Customer</th>
                            <th style={{ padding: '12px' }}>Items</th>
                            <th style={{ padding: '12px' }}>Total</th>
                            <th style={{ padding: '12px' }}>Status</th>
                            <th style={{ padding: '12px' }}>UTR / Txn ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id} style={{ borderBottom: '1px solid #ddd' }}>
                                <td style={{ padding: '12px' }}>{new Date(order.date).toLocaleString()}</td>
                                <td style={{ padding: '12px' }}>#{order.id}</td>
                                <td style={{ padding: '12px' }}>
                                    <strong>{order.customer.name}</strong><br />
                                    {order.customer.phone}<br />
                                    {order.customer.city}
                                </td>
                                <td style={{ padding: '12px' }}>
                                    {order.items.map((item, idx) => (
                                        <div key={idx}>
                                            {item.name} x {item.quantity}
                                        </div>
                                    ))}
                                </td>
                                <td style={{ padding: '12px' }}>₹{order.total}</td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '4px 8px', borderRadius: '4px', fontSize: '0.9rem' }}>
                                        {order.status}
                                    </span>
                                </td>
                                <td style={{ padding: '12px' }}>{order.transactionId}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Admin;
