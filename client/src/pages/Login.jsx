import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import { auth, googleProvider, RecaptchaVerifier, signInWithPhoneNumber, signInWithPopup } from '../firebase';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, loginWithGoogle } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const userObj = result.user;
            const res = await loginWithGoogle(userObj);

            if (res.success) {
                showToast('Welcome to Nature\'s Pledge! 🌿');
                if (userObj.email === 'tilakmishra.76@gmail.com') {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (error) {
            console.error("Google Login Error:", error);
            if (error.code === 'auth/unauthorized-domain') {
                showToast('Google Login blocked by Firebase on this IP address. Please test on localhost or add this IP to Firebase.', 'error');
            } else {
                showToast('Google login failed: ' + error.message, 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const result = await login(email, password);
        setIsLoading(false);

        if (result.success) {
            showToast('Welcome back! 👋');
            if (result.user?.role === 'admin' || email === 'tilakmishra.76@gmail.com') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } else {
            showToast(result.message, 'error');
        }
    };

    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);

    const onCaptchaVerify = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': (response) => {
                    // reCAPTCHA solved. signInWithPhoneNumber will proceed automatically.
                },
                'expired-callback': () => {
                    showToast('Security check expired. Please try again.', 'error');
                    window.recaptchaVerifier.clear();
                    window.recaptchaVerifier = null;
                }
            });
        }
    };

    const handleSendOtp = async () => {
        setIsLoading(true);
        onCaptchaVerify();
        const appVerifier = window.recaptchaVerifier;
        const formatPh = phoneNumber.startsWith('+') ? phoneNumber : '+91' + phoneNumber;

        try {
            const result = await signInWithPhoneNumber(auth, formatPh, appVerifier);
            setConfirmationResult(result);
            setIsOtpSent(true);
            showToast('Code sent to ' + phoneNumber, 'success');
        } catch (error) {
            console.error("OTP Send Error:", error);
            if (error.code === 'auth/unauthorized-domain') {
                showToast('Phone Login blocked by Firebase on this IP address. Please test on localhost.', 'error');
            } else if (error.code === 'auth/billing-not-enabled' || error.message.includes('billing')) {
                showToast('Firebase SMS requires a Blaze Plan (Pay as you go) to send OTPs to India.', 'error');
            } else {
                showToast('SMS Error: Firebase Blaze Plan required for OTPs.', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const userCredential = await confirmationResult.confirm(otp);
            const userObj = userCredential.user;

            const userData = {
                id: userObj.uid,
                name: 'Phone User',
                phoneNumber: phoneNumber,
                role: 'user'
            };

            // Sync with backend
            try {
                const res = await axios.post('/api/users/sync', userData);
                const finalUser = { ...userData, ...res.data };
                localStorage.setItem('user', JSON.stringify(finalUser));
                await axios.post('/api/users/log-activity', {
                    userId: finalUser.id,
                    userName: finalUser.name,
                    action: 'Logged in (Phone OTP)'
                });
            } catch (err) {
                localStorage.setItem('user', JSON.stringify(userData));
            }

            showToast('Welcome to Nature\'s Pledge! 🌿');
            navigate('/shop');
        } catch (error) {
            console.error("OTP Verify Error:", error);
            showToast('Incorrect OTP. Try again!', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Welcome Back</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            required
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            required
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="login-btn"
                    >
                        {isLoading ? 'Logging in...' : 'Sign In'}
                    </button>
                </form>

                <div id="recaptcha-container"></div>

                <div className="alternative-login" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>

                    {/* Google Login Section */}
                    <div className="google-login-section" style={{ borderBottom: '1px solid #eee', paddingBottom: '1.5rem', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', color: '#888', textAlign: 'center', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Quick Social Login</h3>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '50px',
                                    border: '1px solid #ddd',
                                    background: 'white',
                                    color: '#444',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                }}
                            >
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" width="18" />
                                {isLoading ? 'Please wait...' : 'Continue with Google'}
                            </button>
                        </div>
                    </div>

                    {/* WhatsApp Login Section */}
                    <div className="phone-login-section">
                        <h3 style={{ fontSize: '0.9rem', color: '#888', textAlign: 'center', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Login via WhatsApp</h3>

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button
                                type="button"
                                onClick={() => {
                                    const message = encodeURIComponent("Namaste Nature's Pledge 🌿,\n\nI want to login/signup to my account. My details are:\nName: [Your Name]\n\nPlease register my number.");
                                    window.open(`https://wa.me/919958776101?text=${message}`, '_blank');
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '50px',
                                    border: 'none',
                                    background: '#25D366',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 10px rgba(37, 211, 102, 0.3)',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" width="22" style={{ filter: 'brightness(0) invert(1)' }} />
                                Order & Login via WhatsApp
                            </button>
                        </div>
                    </div>


                </div>

                <div className="auth-footer">
                    Don't have an account?
                    <Link to="/signup" className="auth-link">Sign up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
