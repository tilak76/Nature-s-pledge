import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signup } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const result = signup({ name, email, password });
        if (result.success) {
            showToast('Account created successfully! 🎉');
            navigate('/dashboard');
        } else {
            showToast(result.message, 'error');
        }
    };

    return (
        <div className="container" style={{ padding: '4rem 0', maxWidth: '400px' }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#3E2723' }}>Create Account</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>Full Name</label>
                        <input
                            type="text"
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>Email</label>
                        <input
                            type="email"
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>Password</label>
                        <input
                            type="password"
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        style={{ width: '100%', padding: '12px', background: '#5D4037', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Sign Up
                    </button>
                </form>
                <div style={{ marginTop: '1.5rem', textAlign: 'center', color: '#666' }}>
                    Already have an account? <Link to="/login" style={{ color: '#5D4037', fontWeight: 'bold' }}>Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
