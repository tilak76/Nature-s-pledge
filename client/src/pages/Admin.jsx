import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

const ADMIN_EMAIL = 'tilakmishra.76@gmail.com';

const Admin = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [activityLogs, setActivityLogs] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders');
    const chatScrollRef = useRef(null);

    const [newProduct, setNewProduct] = useState({
        name: '', price: '', description: '', category: 'Walnut', image: '', stock: 100
    });

    const [dbStatus, setDbStatus] = useState('Checking...');

    const fetchConversations = async () => {
        try {
            const res = await axios.get('/api/messages/admin/all').catch(() => ({ data: [] }));
            setConversations(res.data);
        } catch (e) { console.error("Conversations fetch error:", e); }
    };

    const [tabLoading, setTabLoading] = useState(false);
    const hasLoadedInitial = useRef(false);

    const refreshData = async (targetTab = activeTab) => {
        if (!hasLoadedInitial.current) setLoading(true);
        else setTabLoading(true);

        try {
            if (targetTab === 'orders') {
                const res = await axios.get('/api/orders');
                setOrders(res.data);
            } else if (targetTab === 'products') {
                const res = await axios.get('/api/products');
                setAllProducts(res.data);
            } else if (targetTab === 'users') {
                const res = await axios.get('/api/users');
                setAllUsers(res.data);
            } else if (targetTab === 'chats') {
                await fetchConversations();
            }

            // Always check DB status on switch
            const healthRes = await axios.get('/api/health').catch(() => ({ data: { mongodb: 'disconnected', database: 'Network Error' } }));
            setDbStatus(healthRes.data.database || (healthRes.data.mongodb === 'connected' ? 'Cloud Connected' : 'Disconnected'));

            // Add a small build version indicator to the console for debugging
            if (healthRes.data.build) console.log(`Backend Version: ${healthRes.data.build}`);

        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
            setTabLoading(false);
            hasLoadedInitial.current = true;
        }
    };

    useEffect(() => {
        refreshData();
        const interval = setInterval(() => {
            if (activeTab === 'chats') fetchConversations();
            else refreshData(activeTab);
        }, 30000); // Background refresh every 30s
        return () => clearInterval(interval);
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'chats' && selectedChat) {
            const pollSelectedChat = async () => {
                try {
                    const res = await axios.get(`/api/messages/${selectedChat.id}`);
                    setSelectedChat(prev => ({ ...prev, messages: res.data }));
                } catch (e) { console.error("Poll error:", e); }
            };
            const chatInterval = setInterval(pollSelectedChat, 5000);
            return () => clearInterval(chatInterval);
        }
    }, [activeTab, selectedChat?.id]);

    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [selectedChat?.messages]);

    useEffect(() => {
        if (!authLoading && (!user || user.email !== ADMIN_EMAIL)) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await axios.patch(`/api/orders/${orderId}`, { status: newStatus });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await axios.delete(`/api/products/${productId}`);
            setAllProducts(prev => prev.filter(p => p._id !== productId));
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/products', newProduct);
            setAllProducts(prev => [res.data, ...prev]);
            setNewProduct({ name: '', price: '', description: '', category: 'Walnut', image: '', stock: 100 });
            alert("Product added!");
        } catch (err) {
            console.error("Add failed:", err);
        }
    };

    if (authLoading || loading) return <div className="container" style={{ padding: '2rem' }}>Loading Admin Panel...</div>;
    if (!user || user.email !== ADMIN_EMAIL) return null;

    return (
        <div className="admin-container">
            <div className="admin-header" style={{ opacity: tabLoading ? 0.6 : 1, transition: 'opacity 0.3s' }}>
                <div>
                    <h2 className="admin-title">
                        Nature's Pledge Admin Console
                        {tabLoading && <span style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>Updating...</span>}
                    </h2>
                    <div style={{ marginTop: '8px' }}>
                        <span className={`status-badge ${dbStatus.includes('Connected (MongoDB)') ? 'status-connected' : 'status-fallback'}`}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }}></span>
                            {dbStatus}
                        </span>
                    </div>
                </div>

                <div className="admin-tabs">
                    <button onClick={() => setActiveTab('orders')} className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}>
                        📦 Orders
                    </button>
                    <button onClick={() => setActiveTab('products')} className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}>
                        🏷️ Inventory
                    </button>
                    <button onClick={() => setActiveTab('users')} className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}>
                        👥 Users
                    </button>
                    <button onClick={() => setActiveTab('chats')} className={`admin-tab ${activeTab === 'chats' ? 'active' : ''}`}>
                        💬 Inquiries
                        {conversations.some(c => c.unreadCount > 0) && (
                            <span className="badge-notification">
                                {conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0)}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {activeTab === 'orders' ? (
                <div className="orders-admin">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3>Recent Orders ({orders.length})</h3>
                        <button onClick={() => window.print()} style={{ padding: '8px 15px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>Print Orders</button>
                    </div>

                    {orders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#888', background: 'white', borderRadius: '8px' }}>No orders found. Items usually appear here after successful payment.</div>
                    ) : (
                        orders.map(order => (
                            <div key={order.id} style={{ border: '1px solid #eee', padding: '20px', borderRadius: '12px', marginBottom: '20px', background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                                {/* Header Row */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f9f9f9', paddingBottom: '15px', marginBottom: '15px' }}>
                                    <div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#5D4037' }}>Order #{order.id}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(order.date).toLocaleString()}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: '6px',
                                                border: '1px solid #ddd',
                                                background: order.status === 'Delivered' ? '#e8f5e9' : (order.status === 'Cancelled' ? '#ffebee' : '#fff'),
                                                color: order.status === 'Delivered' ? '#2e7d32' : (order.status === 'Cancelled' ? '#c62828' : '#333'),
                                                fontWeight: 'bold',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <option value="Processing">Processing</option>
                                            <option value="Packed">Packed</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Out for Delivery">Out for Delivery</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                                    {/* Customer & Shipping Info */}
                                    <div style={{ background: '#fdfaf7', padding: '15px', borderRadius: '8px', border: '1px solid #f0e6e0' }}>
                                        <h4 style={{ margin: '0 0 10px 0', color: '#8D6E63', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            📍 Shipping Details
                                        </h4>
                                        <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                                            <strong>{order.shipping?.fullName || order.customer?.name}</strong><br />
                                            {order.shipping?.address || order.customer?.address}<br />
                                            {order.shipping?.city || order.customer?.city} - {order.shipping?.pincode || order.customer?.pincode}<br />
                                            <strong>Phone:</strong> {order.shipping?.phone || order.customer?.phone}<br />
                                            <strong>Email:</strong> {order.userEmail || order.customer?.email}
                                            {order.notes && (
                                                <div style={{ marginTop: '10px', padding: '8px', background: '#fff9c4', borderRadius: '4px', borderLeft: '3px solid #fbc02d', fontStyle: 'italic' }}>
                                                    "Note: {order.notes}"
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Items & Payment */}
                                    <div>
                                        <h4 style={{ margin: '0 0 10px 0', color: '#8D6E63' }}>📦 Items List</h4>
                                        <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px', padding: '10px' }}>
                                            {(order.items || []).map((item, idx) => (
                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: idx === (order.items?.length - 1) ? 'none' : '1px solid #f9f9f9', fontSize: '0.85rem' }}>
                                                    <span>{item.name} × {item.quantity || 1} {item.weight && `(${item.weight})`}</span>
                                                    <span style={{ fontWeight: '500' }}>₹{item.price * (item.quantity || 1)}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ marginTop: '15px', padding: '10px', background: '#f5f5f5', borderRadius: '8px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', color: '#B12704' }}>
                                                <span>Total Amount:</span>
                                                <span>₹{order.total || order.totalAmount}</span>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '5px' }}>
                                                <strong>Payment:</strong> {order.paymentMethod === 'razorpay' ? 'Paid via Razorpay' : (order.paymentMethod === 'wallet' ? 'Paid via Wallet' : 'Cash on Delivery')}
                                                <br />
                                                <strong>Txn ID:</strong> {order.transactionId || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : activeTab === 'products' ? (
                <div className="products-admin">
                    <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                        <h4>Add New Product</h4>
                        <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                            <input required type="text" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Name" />
                            <input required type="number" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="Price" />
                            <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
                                <option value="Walnut">Walnut</option>
                                <option value="Almond">Almond</option>
                                <option value="Rajma">Rajma</option>
                                <option value="Atta">Atta</option>
                                <option value="Chutney">Chutney</option>
                            </select>
                            <input required type="text" value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} placeholder="Image URL" />
                            <button type="submit" style={{ background: '#2e7d32', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Add</button>
                        </form>
                    </div>
                    {allProducts.map(p => (
                        <div key={p._id || p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
                            <span>{p.name} - ₹{p.price}</span>
                            <button onClick={() => handleDeleteProduct(p._id || p.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
                        </div>
                    ))}
                </div>
            ) : activeTab === 'users' ? (
                <div className="users-admin">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3>Registered Customers ({Array.isArray(allUsers) ? allUsers.length : 0})</h3>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>Showing users & active cart tracking</div>
                    </div>

                    {!Array.isArray(allUsers) || allUsers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#888', background: 'white', borderRadius: '12px' }}>No users found yet.</div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                            {allUsers.map((u, idx) => (
                                <div key={u._id || u.email || idx} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '20px', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#efebe9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#5D4037' }}>
                                            {u.name?.charAt(0) || 'U'}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 'bold', color: '#333' }}>{u.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#777' }}>{u.email || u.phoneNumber}</div>
                                        </div>
                                        {u.role === 'admin' && (
                                            <span style={{ fontSize: '0.7rem', background: '#e3f2fd', color: '#1976d2', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>ADMIN</span>
                                        )}
                                    </div>

                                    <div style={{ fontSize: '0.85rem', color: '#555', borderTop: '1px solid #f5f5f5', paddingTop: '10px' }}>
                                        <div style={{ marginBottom: '5px' }}>
                                            📅 <strong>Joined:</strong> {new Date(u.createdAt || Date.now()).toLocaleDateString()}
                                        </div>
                                        <div>
                                            🕒 <strong>Last Login:</strong> {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}
                                        </div>
                                    </div>

                                    {/* Cart Tracking */}
                                    <div style={{ background: u.cart?.length > 0 ? '#fff8e1' : '#f9f9f9', padding: '12px', borderRadius: '8px', border: u.cart?.length > 0 ? '1px solid #ffe082' : '1px solid #eee' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            🛒 {u.cart?.length > 0 ? 'Items in Cart' : 'Cart is Empty'}
                                            {u.cart?.length > 0 && <span style={{ width: '18px', height: '18px', background: '#ffc107', color: 'white', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>{u.cart.length}</span>}
                                        </div>

                                        {u.cart?.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                {u.cart.slice(0, 3).map((item, idx) => (
                                                    <div key={idx} style={{ fontSize: '0.8rem', color: '#5D4037', display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>{item.name} × {item.quantity}</span>
                                                        <span>₹{item.price * item.quantity}</span>
                                                    </div>
                                                ))}
                                                {u.cart.length > 3 && <div style={{ fontSize: '0.75rem', color: '#888', fontStyle: 'italic' }}>+ {u.cart.length - 3} more items...</div>}
                                                <div style={{ marginTop: '5px', paddingTop: '5px', borderTop: '1px dashed #ffd54f', textAlign: 'right', fontWeight: 'bold', fontSize: '0.85rem', color: '#B12704' }}>
                                                    Cart Total: ₹{u.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: '0.8rem', color: '#999', fontStyle: 'italic' }}>No items added to cart yet.</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="chat-workspace">
                    <div className={`chat-sidebar ${selectedChat ? 'hidden-mobile' : ''}`}>
                        <div className="chat-sidebar-header">
                            Customer Inquiries ({conversations.length})
                        </div>
                        <div className="chat-list">
                            {conversations.length === 0 ? (
                                <div className="empty-state" style={{ padding: '2rem' }}>
                                    <div className="empty-state-icon">📭</div>
                                    <p>No messages yet.</p>
                                </div>
                            ) : (
                                conversations.map(conv => (
                                    <div
                                        key={conv._id}
                                        className={`chat-item ${selectedChat?.id === conv._id ? 'active' : ''}`}
                                        onClick={async () => {
                                            const res = await axios.get(`/api/messages/${conv._id}`);
                                            setSelectedChat({ id: conv._id, userName: conv.userName, userEmail: conv.userEmail, messages: res.data });
                                            await axios.patch(`/api/messages/admin/read/${conv._id}`);
                                            fetchConversations();
                                        }}
                                    >
                                        <div className="chat-item-name">
                                            {conv.userName || 'Anonymous'}
                                            {conv.unreadCount > 0 && <span style={{ color: '#e74c3c', fontSize: '0.8rem' }}>{conv.unreadCount} New</span>}
                                        </div>
                                        <div className="chat-item-preview">{conv.lastMessage || 'Open to view...'}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {selectedChat ? (
                        <div className={`chat-main ${!selectedChat ? 'hidden-mobile' : ''}`}>
                            <div className="chat-main-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <button
                                        className="btn-action"
                                        style={{ background: '#eee', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 12px' }}
                                        onClick={() => setSelectedChat(null)}
                                    >
                                        ← Back
                                    </button>
                                    <div>
                                        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: '#2c3e50' }}>{selectedChat.userName}</h3>
                                        <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>{selectedChat.userEmail || 'No email provided'}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        className="btn-action btn-warning"
                                        onClick={async () => {
                                            if (window.confirm('Ask customer if issue is resolved?')) {
                                                const res = await axios.post('/api/messages', { userId: selectedChat.id, userName: 'Admin', text: 'Hi, checking in to see if your problem is resolved now? Do you have any other inquiries?', isAdmin: true });
                                                setSelectedChat(prev => ({ ...prev, messages: [...prev.messages, res.data] }));
                                                fetchConversations();
                                            }
                                        }}>Ask Status</button>

                                    <button
                                        className="btn-action btn-danger"
                                        onClick={async () => {
                                            if (window.confirm('Close and clear this inquiry?')) {
                                                await axios.delete(`/api/messages/admin/resolve/${selectedChat.id}`);
                                                setSelectedChat(null);
                                                fetchConversations();
                                            }
                                        }}>Close Ticket</button>
                                </div>
                            </div>

                            <div className="chat-messages" ref={chatScrollRef}>
                                {selectedChat.messages.length === 0 ? (
                                    <div className="empty-state">No messages history.</div>
                                ) : (
                                    selectedChat.messages.map((m, idx) => (
                                        <div key={idx} className={`message-bubble ${m.isAdmin ? 'message-admin' : 'message-user'}`}>
                                            {m.text}
                                            <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '4px', textAlign: m.isAdmin ? 'right' : 'left' }}>
                                                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <form className="chat-input-area" onSubmit={async (e) => {
                                e.preventDefault();
                                if (!replyText.trim()) return;
                                const res = await axios.post('/api/messages', { userId: selectedChat.id, userName: 'Admin', text: replyText, isAdmin: true });
                                setSelectedChat(prev => ({ ...prev, messages: [...prev.messages, res.data] }));
                                setReplyText('');
                            }}>
                                <input
                                    type="text"
                                    className="chat-input"
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    placeholder="Type your reply here..."
                                />
                                <button type="submit" className="chat-send-btn">Send</button>
                            </form>
                        </div>
                    ) : (
                        <div className={`chat-main empty-state ${!selectedChat ? 'hidden-mobile' : ''}`}>
                            <div className="empty-state-icon">💬</div>
                            <h2>Select an Inquiry</h2>
                            <p>Click on a customer chat from the sidebar to view and respond.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Admin;
