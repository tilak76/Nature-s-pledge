import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import './Dashboard.css';

const Dashboard = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [view, setView] = useState('home'); // 'home', 'orders', 'profile', 'wallet'
    const { showToast } = useToast();
    const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false);
    const [amountToAdd, setAmountToAdd] = useState('');

    if (!user) {
        navigate('/login');
        return null;
    }

    const handleOpenAddMoney = () => {
        setAmountToAdd('');
        setIsAddMoneyModalOpen(true);
    };

    const handleConfirmAddMoney = (e) => {
        e.preventDefault();
        const amount = parseFloat(amountToAdd);
        if (!amount || amount <= 0) {
            showToast('Please enter a valid amount', 'error');
            return;
        }

        const options = {
            key: "rzp_live_S0W61ZvJ61G4Ec", // LIVE KEY
            amount: amount * 100, // paise
            currency: "INR",
            name: "Nature's Pledge Wallet",
            description: "Wallet Top-up",
            image: "https://via.placeholder.com/150",
            handler: function (response) {
                if (response.razorpay_payment_id) {
                    const newBalance = (user.walletBalance || 0) + amount;
                    updateUser({ walletBalance: newBalance });
                    showToast(`Success! ₹${amount} added to wallet.`, 'success');
                    setIsAddMoneyModalOpen(false);
                }
            },
            prefill: {
                name: user?.name,
                email: user?.email,
                contact: user?.phone || ''
            },
            theme: { color: "#5D4037" },
            modal: {
                ondismiss: function () {
                    showToast('Transaction Cancelled', 'info');
                }
            }
        };

        try {
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                showToast(response.error.description || 'Top-up Failed', 'error');
            });
            rzp.open();
        } catch (err) {
            console.error(err);
            showToast('Payment Gateway Error. Check connection.', 'error');
        }
    };

    // Components
    const DashboardCard = ({ icon, title, description, onClick }) => (
        <div
            onClick={onClick}
            className="dashboard-card"
            style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                cursor: 'pointer',
                display: 'flex',
                gap: '20px',
                alignItems: 'center',
                backgroundColor: 'white',
                transition: 'background-color 0.2s, box-shadow 0.2s'
            }}
        >
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
                {icon}
            </div>
            <div>
                <h3 style={{ margin: '0 0 5px 0', fontWeight: '500', fontSize: '1.1rem', color: '#333' }}>{title}</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{description}</p>
            </div>
        </div>
    );

    const Breadcrumb = ({ title }) => (
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#565959' }}>
            <span
                onClick={() => setView('home')}
                style={{ cursor: 'pointer', color: '#007185' }}
                onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.target.style.textDecoration = 'none'}
            >
                Your Account
            </span>
            <span>›</span>
            <span style={{ color: '#C7511F', fontWeight: '600' }}>{title}</span>
        </div>
    );

    // Views
    const renderHome = () => (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontWeight: '400', fontSize: '1.8rem', marginBottom: '20px' }}>Your Account</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <DashboardCard
                    icon="📦"
                    title="Your Orders"
                    description="Track, return, or buy things again"
                    onClick={() => setView('orders')}
                />
                <DashboardCard
                    icon="🔒"
                    title="Login & security"
                    description="Edit login, name, and mobile number"
                    onClick={() => setView('profile')}
                />
                <DashboardCard
                    icon="💳"
                    title="Nature's Wallet"
                    description="Add money, view balance, and transactions"
                    onClick={() => setView('wallet')}
                />
                <DashboardCard
                    icon="📍"
                    title="Your Addresses"
                    description="Edit addresses for orders and gifts"
                    onClick={() => showToast('Address management coming soon!')}
                />
                <DashboardCard
                    icon="🎧"
                    title="Contact Us"
                    description="Contact our customer service via phone or chat"
                    onClick={() => window.location.href = 'mailto:support@naturepledge.com'}
                />
                <DashboardCard
                    icon="🚪"
                    title="Sign Out"
                    description="Log out of your account securely"
                    onClick={logout}
                />
            </div>
        </div>
    );

    const renderOrders = () => (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <Breadcrumb title="Your Orders" />
            <h2 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px', fontWeight: '400', marginBottom: '20px' }}>Your Orders</h2>

            <div style={{ background: '#fcf8f6', border: '1px solid #eee', borderRadius: '8px', padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📦</div>
                <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>No orders yet</h3>
                <p style={{ color: '#666', marginBottom: '20px' }}>You haven't placed any orders yet.</p>
                <button
                    onClick={() => navigate('/shop')}
                    style={{ background: '#F7CA00', border: '1px solid #FCD200', padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(213, 217, 217, 0.5)' }}
                >
                    Start Shopping
                </button>
            </div>
        </div>
    );

    const renderProfile = () => (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Breadcrumb title="Login & Security" />
            <h2 style={{ fontWeight: '400', marginBottom: '20px' }}>Login & Security</h2>

            <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>Name</div>
                        <div style={{ color: '#333' }}>{user.name}</div>
                    </div>
                    <button style={{ background: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '6px 15px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(213,217,217,0.5)' }}>Edit</button>
                </div>
                <div style={{ padding: '20px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>Email</div>
                        <div style={{ color: '#333' }}>{user.email}</div>
                    </div>
                    <button style={{ background: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '6px 15px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(213,217,217,0.5)' }}>Edit</button>
                </div>
                <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>Password</div>
                        <div style={{ color: '#333' }}>********</div>
                    </div>
                    <button style={{ background: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '6px 15px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(213,217,217,0.5)' }}>Edit</button>
                </div>
            </div>

            <button
                onClick={() => setView('home')}
                style={{ marginTop: '20px', background: '#F7CA00', border: '1px solid #FCD200', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 2px 5px rgba(213, 217, 217, 0.5)' }}
            >
                Done
            </button>
        </div>
    );

    const renderWallet = () => (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Breadcrumb title="Nature's Wallet" />
            <h2 style={{ fontWeight: '400', marginBottom: '20px' }}>Nature's Wallet Balance</h2>

            <div style={{
                background: 'linear-gradient(to right, #232f3e, #37475a)',
                color: 'white',
                padding: '30px',
                borderRadius: '8px',
                marginBottom: '30px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
            }}>
                <div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '5px' }}>Current Balance</div>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>₹{user.walletBalance?.toLocaleString() || '0'}</div>
                </div>
                <button
                    onClick={handleOpenAddMoney}
                    style={{ background: '#F7CA00', color: 'black', border: 'none', padding: '12px 30px', borderRadius: '25px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    Add Money
                </button>
            </div>

            <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '15px' }}>Transactions</h3>
            <p style={{ color: '#666', fontStyle: 'italic' }}>No transactions found for the selected period.</p>
        </div>
    );

    const getViewContent = () => {
        switch (view) {
            case 'orders': return renderOrders();
            case 'profile': return renderProfile();
            case 'wallet': return renderWallet();
            default: return renderHome();
        }
    };

    return (
        <div className="container" style={{ padding: '30px 20px', minHeight: '80vh', fontFamily: '"Amazon Ember", Arial, sans-serif' }}>
            {getViewContent()}

            <Modal
                isOpen={isAddMoneyModalOpen}
                onClose={() => setIsAddMoneyModalOpen(false)}
                title="Top Up Wallet"
            >
                <form onSubmit={handleConfirmAddMoney}>
                    <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💳</div>
                        <p style={{ color: '#666' }}>Enter amount to add to your Wallet.</p>
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: '500' }}>Amount (₹)</label>
                        <input
                            type="number"
                            min="1"
                            placeholder="e.g. 500"
                            value={amountToAdd}
                            onChange={(e) => setAmountToAdd(e.target.value)}
                            style={{ width: '100%', padding: '12px', fontSize: '1.2rem', borderRadius: '8px', border: '1px solid #ddd' }}
                            autoFocus
                        />
                    </div>
                    <button
                        type="submit"
                        style={{ width: '100%', padding: '15px', background: '#F7CA00', color: '#111', border: '1px solid #fcd200', borderRadius: '8px', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 2px 5px rgba(213,217,217,0.5)' }}
                    >
                        Proceed to Pay
                    </button>
                </form>
            </Modal>

            <style>{`
                .dashboard-card:hover {
                    background-color: #f7f7f7 !important;
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
