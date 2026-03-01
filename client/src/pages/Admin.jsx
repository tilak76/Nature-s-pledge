import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

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
            const healthRes = await axios.get('/api/health').catch(() => ({ data: { mongodb: 'disconnected' } }));
            setDbStatus(healthRes.data.mongodb === 'connected' ? 'Connected (MongoDB)' : 'Connected (JSON Fallback)');

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
        <div className="container" style={{ padding: '2rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', opacity: tabLoading ? 0.6 : 1, transition: 'opacity 0.3s' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h2 style={{ margin: 0 }}>Nature's Pledge Admin Console</h2>
                        {tabLoading && <span style={{ fontSize: '0.8rem', color: '#5D4037', fontStyle: 'italic' }}>Updating...</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', marginTop: '5px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: dbStatus.includes('Connected') ? '#4caf50' : '#f44336' }}></span>
                        <span>{dbStatus}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setActiveTab('orders')} style={{ padding: '10px 20px', background: activeTab === 'orders' ? '#5D4037' : 'white', color: activeTab === 'orders' ? 'white' : '#5D4037', border: '1px solid #5D4037', borderRadius: '5px', cursor: 'pointer' }}>Orders</button>
                    <button onClick={() => setActiveTab('products')} style={{ padding: '10px 20px', background: activeTab === 'products' ? '#5D4037' : 'white', color: activeTab === 'products' ? 'white' : '#5D4037', border: '1px solid #5D4037', borderRadius: '5px', cursor: 'pointer' }}>Inventory</button>
                    <button onClick={() => setActiveTab('users')} style={{ padding: '10px 20px', background: activeTab === 'users' ? '#5D4037' : 'white', color: activeTab === 'users' ? 'white' : '#5D4037', border: '1px solid #5D4037', borderRadius: '5px', cursor: 'pointer' }}>Users</button>
                    <button onClick={() => setActiveTab('chats')} style={{ padding: '10px 20px', background: activeTab === 'chats' ? '#5D4037' : 'white', color: activeTab === 'chats' ? 'white' : '#5D4037', border: '1px solid #5D4037', borderRadius: '5px', cursor: 'pointer', position: 'relative' }}>
                        Inquiries
                        {conversations.some(c => c.unreadCount > 0) && <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '50%' }}>!</span>}
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
                            {allUsers.map(u => (
                                <div key={u._id} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '20px', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                <div className="chats-admin" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
                    <div style={{ border: '1px solid #eee', borderRadius: '8px', background: 'white' }}>
                        <div style={{ padding: '15px', background: '#f5f5f5', fontWeight: 'bold' }}>All Inquiries ({conversations.length})</div>
                        {conversations.map(conv => (
                            <div key={conv._id} onClick={async () => {
                                const res = await axios.get(`/api/messages/${conv._id}`);
                                setSelectedChat({ id: conv._id, userName: conv.userName, userEmail: conv.userEmail, messages: res.data });
                                await axios.patch(`/api/messages/admin/read/${conv._id}`);
                                fetchConversations();
                            }} style={{ padding: '15px', borderBottom: '1px solid #f9f9f9', cursor: 'pointer', background: selectedChat?.id === conv._id ? '#e3f2fd' : 'transparent' }}>
                                <div style={{ fontWeight: 'bold' }}>{conv.userName} {conv.unreadCount > 0 && <span style={{ color: 'red' }}>({conv.unreadCount})</span>}</div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>{conv.lastMessage}</div>
                            </div>
                        ))}
                    </div>
                    {selectedChat ? (
                        <div style={{ border: '1px solid #eee', borderRadius: '8px', background: 'white', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '15px', borderBottom: '1px solid #eee', background: '#f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div><strong>Chat with {selectedChat.userName}</strong><div style={{ fontSize: '0.75rem' }}>{selectedChat.userEmail}</div></div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={async () => {
                                        if (window.confirm('Ask customer if issue is resolved?')) {
                                            const res = await axios.post('/api/messages', { userId: selectedChat.id, userName: 'Admin', text: 'Is your problem resolved now? Do you have any other inquiries?', isAdmin: true });
                                            setSelectedChat(prev => ({ ...prev, messages: [...prev.messages, res.data] }));
                                            fetchConversations();
                                        }
                                    }} style={{ padding: '6px 12px', background: '#f57c00', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Ask if Resolved</button>

                                    <button onClick={async () => {
                                        if (window.confirm('Close and clear this inquiry?')) {
                                            await axios.delete(`/api/messages/admin/resolve/${selectedChat.id}`);
                                            setSelectedChat(null);
                                            fetchConversations();
                                        }
                                    }} style={{ padding: '6px 12px', background: '#c62828', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close Ticket</button>
                                </div>
                            </div>
                            <div ref={chatScrollRef} style={{ flex: 1, padding: '20px', maxHeight: '450px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {selectedChat.messages.map((m, idx) => (
                                    <div key={idx} style={{ alignSelf: m.isAdmin ? 'flex-end' : 'flex-start', background: m.isAdmin ? '#5D4037' : '#eee', color: m.isAdmin ? 'white' : 'black', padding: '10px 15px', borderRadius: '15px', maxWidth: '70%' }}>{m.text}</div>
                                ))}
                            </div>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                if (!replyText.trim()) return;
                                const res = await axios.post('/api/messages', { userId: selectedChat.id, userName: 'Admin', text: replyText, isAdmin: true });
                                setSelectedChat(prev => ({ ...prev, messages: [...prev.messages, res.data] }));
                                setReplyText('');
                            }} style={{ padding: '15px', display: 'flex', gap: '10px' }}>
                                <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)} style={{ flex: 1, padding: '10px' }} placeholder="Type reply..." />
                                <button type="submit" style={{ padding: '10px 20px', background: '#5D4037', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Send</button>
                            </form>
                        </div>
                    ) : <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Select a chat to respond</div>}
                </div>
            )}
        </div>
    );
};

export default Admin;
