import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const Dashboard = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const { showToast } = useToast();

    if (!user) {
        navigate('/login');
        return null;
    }

    const handleAddMoney = () => {
        // Mock Add Money
        const amount = 500; // Fixed mock amount for demo
        const newBalance = (user.walletBalance || 0) + amount;
        updateUser({ walletBalance: newBalance });
        showToast(`Added ₹${amount} to wallet! 💰`);
    };

    const TabButton = ({ id, label, icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            style={{
                width: '100%',
                textAlign: 'left',
                padding: '15px 20px',
                background: activeTab === id ? '#5D4037' : 'transparent',
                color: activeTab === id ? 'white' : '#555',
                border: 'none',
                borderRadius: '8px',
                marginBottom: '8px',
                cursor: 'pointer',
                fontWeight: activeTab === id ? '600' : '400',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.3s ease'
            }}
        >
            <span style={{ fontSize: '1.2rem' }}>{icon}</span> {label}
        </button>
    );

    const WalletCard = () => (
        <div style={{
            background: 'linear-gradient(135deg, #1e1e1e 0%, #3E2723 100%)',
            color: '#fff',
            padding: '25px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(62, 39, 35, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '2rem'
        }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '150px', height: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                <div>
                    <h4 style={{ margin: '0 0 5px 0', opacity: 0.7, fontWeight: '400' }}>Nature Pledge Wallet</h4>
                    <span style={{ fontSize: '0.9rem', opacity: 0.5 }}>Premium Member</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', fontStyle: 'italic' }}>NP</div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '600', letterSpacing: '1px' }}>
                    ₹{user.walletBalance?.toLocaleString() || '0'}
                </h2>
                <p style={{ margin: '5px 0 0', opacity: 0.6, fontSize: '0.9rem' }}>Available Balance</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ fontFamily: 'monospace', letterSpacing: '2px', opacity: 0.8 }}>
                    •••• •••• •••• {user.id ? user.id.toString().slice(-4) : '0000'}
                </div>
                <div style={{ opacity: 0.8 }}>
                    EXP 12/30
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                        <h2 style={{ margin: '0 0 25px 0', color: '#3E2723' }}>My Profile</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                            <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                                <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '5px' }}>Full Name</label>
                                <div style={{ fontSize: '1.1rem', color: '#333', fontWeight: '500' }}>{user.name}</div>
                            </div>
                            <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                                <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '5px' }}>Email Address</label>
                                <div style={{ fontSize: '1.1rem', color: '#333', fontWeight: '500' }}>{user.email}</div>
                            </div>
                            <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                                <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '5px' }}>Member Since</label>
                                <div style={{ fontSize: '1.1rem', color: '#333', fontWeight: '500' }}>{new Date(user.id).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <button style={{ marginTop: '25px', padding: '12px 25px', background: 'transparent', border: '1px solid #ddd', borderRadius: '6px', color: '#666', cursor: 'pointer' }}>
                            Edit Profile
                        </button>
                    </div>
                );
            case 'wallet':
                return (
                    <div>
                        <h2 style={{ margin: '0 0 20px 0', color: '#3E2723' }}>Digital Wallet</h2>
                        <div style={{ maxWidth: '400px' }}>
                            <WalletCard />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '500px' }}>
                            <button style={{
                                padding: '15px', background: '#5D4037', color: 'white', border: 'none', borderRadius: '8px',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                fontSize: '1rem', boxShadow: '0 4px 10px rgba(93, 64, 55, 0.2)'
                            }}>
                                <span style={{ fontSize: '1.2rem' }}>+</span> Add Money
                            </button>
                            <button style={{
                                padding: '15px', background: 'white', color: '#5D4037', border: '1px solid #5D4037', borderRadius: '8px',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                fontSize: '1rem'
                            }}>
                                <span style={{ fontSize: '1.2rem' }}>↗</span> Statement
                            </button>
                        </div>
                    </div>
                );
            case 'orders':
                return (
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                        <h2 style={{ margin: '0 0 25px 0', color: '#3E2723' }}>Order History</h2>
                        <div style={{ textAlign: 'center', padding: '40px', background: '#fcf8f6', borderRadius: '8px', border: '1px dashed #e0e0e0' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '15px', opacity: 0.3 }}>📦</div>
                            <h3 style={{ margin: '0 0 10px 0', color: '#555' }}>No orders yet</h3>
                            <p style={{ color: '#888', margin: 0 }}>Start exploring our premium walnuts to make your first purchase.</p>
                            <button
                                onClick={() => navigate('/shop')}
                                style={{ marginTop: '20px', padding: '10px 25px', background: '#5D4037', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                            >
                                Shop Now
                            </button>
                        </div>
                    </div>
                );
            default: // Dashboard Overview
                return (
                    <div>
                        <div style={{ marginBottom: '30px' }}>
                            <h1 style={{ margin: 0, color: '#3E2723' }}>Hello, {user.name.split(' ')[0]}! 👋</h1>
                            <p style={{ color: '#666', marginTop: '5px' }}>Welcome back to your Nature Pledge account.</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '10px', background: '#EFEBE9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#5D4037' }}>
                                    💳
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: '#888' }}>Wallet Balance</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>₹{user.walletBalance || 0}</div>
                                </div>
                            </div>
                            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '10px', background: '#EFEBE9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#5D4037' }}>
                                    🛍️
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: '#888' }}>Total Orders</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>0</div>
                                </div>
                            </div>
                        </div>

                        <h3 style={{ margin: '0 0 20px 0', color: '#3E2723' }}>Recent Activity</h3>
                        <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                            <p style={{ color: '#888', fontStyle: 'italic' }}>No recent activity to show.</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="container" style={{ padding: '3rem 0', minHeight: '80vh' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '40px' }}>
                {/* Sidebar */}
                <div style={{ height: 'fit-content' }}>
                    <div style={{ background: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', textAlign: 'center', marginBottom: '20px' }}>
                        <div style={{ width: '80px', height: '80px', background: '#5D4037', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', fontSize: '2rem', fontWeight: 'bold' }}>
                            {user.name.charAt(0)}
                        </div>
                        <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{user.name}</h3>
                        <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>{user.email}</p>
                    </div>

                    <div style={{ background: 'white', borderRadius: '12px', padding: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                        <TabButton id="dashboard" label="Overview" icon="📊" />
                        <TabButton id="profile" label="My Profile" icon="👤" />
                        <TabButton id="orders" label="My Orders" icon="📦" />
                        <TabButton id="wallet" label="Wallet" icon="💳" />
                        <div style={{ height: '1px', background: '#eee', margin: '10px 0' }}></div>
                        <button
                            onClick={logout}
                            style={{ width: '100%', textAlign: 'left', padding: '15px 20px', color: '#F44336', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.3s ease', borderRadius: '8px' }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>🚪</span> Logout
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div>
                    {renderContent()}
                </div>
            </div>

            {/* Mobile Responsive Style */}
            <style>{`
                @media (max-width: 768px) {
                    .container > div {
                        grid-template-columns: 1fr !important;
                        gap: 20px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
