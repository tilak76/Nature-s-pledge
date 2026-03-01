import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logActivity = async (action, details = {}) => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser) return;
        try {
            await axios.post('/api/users/log-activity', {
                userId: storedUser.id || storedUser.email || 'guest',
                userName: storedUser.name || 'Anonymous',
                userEmail: storedUser.email || 'N/A',
                action,
                details
            });
        } catch (err) {
            console.error("Failed to log activity:", err);
        }
    };

    const syncUserWithBackend = async (userData) => {
        try {
            const res = await axios.post('/api/users/sync', userData);
            return res.data;
        } catch (err) {
            console.error("Failed to sync user:", err);
            return userData;
        }
    };

    useEffect(() => {
        // Check local storage for existing session
        const initAuth = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    // Log session resume
                    logActivity('Session Resumed', { device: navigator.userAgent });
                }

                // SEED ADMIN USER (Client-side fallback)
                const storedUsersRaw = localStorage.getItem('registered_users');
                let storedUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
                if (!Array.isArray(storedUsers)) storedUsers = [];

                const adminEmail = 'tilakmishra.76@gmail.com';
                const adminPassword = 'TILA123@';

                if (!storedUsers.some(u => u.email === adminEmail)) {
                    storedUsers.push({
                        id: 'admin_1',
                        email: adminEmail,
                        password: adminPassword,
                        name: 'Admin Tilak',
                        role: 'admin',
                        walletBalance: 100000,
                        walletHistory: []
                    });
                    localStorage.setItem('registered_users', JSON.stringify(storedUsers));
                }
            } catch (error) {
                console.error("Failed to initialize auth state", error);
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const loginWithGoogle = async (fbUser) => {
        const userData = {
            id: fbUser.uid || fbUser.sub,
            name: fbUser.displayName || fbUser.name,
            email: fbUser.email,
            image: fbUser.photoURL || fbUser.picture,
            role: fbUser.email === 'tilakmishra.76@gmail.com' ? 'admin' : 'user',
            walletBalance: 0,
            walletHistory: []
        };

        // Sync with backend
        const syncedUser = await syncUserWithBackend(userData);
        const finalUser = { ...userData, ...syncedUser };

        setUser(finalUser);
        localStorage.setItem('user', JSON.stringify(finalUser));
        logActivity('Logged in with Google (Firebase)');

        return { success: true, user: finalUser };
    };

    const login = async (email, password) => {
        // Mock Login Logic with simulated latency
        return new Promise((resolve) => {
            setTimeout(async () => {
                try {
                    const storedUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
                    const safeUsers = Array.isArray(storedUsers) ? storedUsers : [];
                    const foundUser = safeUsers.find(u => u.email === email && u.password === password);

                    if (foundUser) {
                        const userData = { ...foundUser };
                        delete userData.password; // Don't keep password in session

                        // Sync with backend
                        const syncedUser = await syncUserWithBackend(userData);
                        const finalUser = { ...userData, ...syncedUser };

                        setUser(finalUser);
                        localStorage.setItem('user', JSON.stringify(finalUser));
                        logActivity('Logged in (Email/Pass)');
                        resolve({ success: true, user: finalUser });
                    } else {
                        resolve({ success: false, message: 'Invalid credentials' });
                    }
                } catch (error) {
                    console.error("Login verification failed", error);
                    resolve({ success: false, message: 'System error. Please clear cache.' });
                }
            }, 1000); // 1 second delay
        });
    };

    const signup = async (userData) => {
        try {
            const storedUsersRaw = localStorage.getItem('registered_users');
            let storedUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
            if (!Array.isArray(storedUsers)) storedUsers = [];

            if (storedUsers.some(u => u.email === userData.email)) {
                return { success: false, message: 'User already exists' };
            }

            const newUser = {
                id: Date.now(),
                ...userData,
                role: userData.email === 'tilakmishra.76@gmail.com' ? 'admin' : 'user', // Set admin role
                walletBalance: 0, // Initial wallet balance
                walletHistory: []
            };

            storedUsers.push(newUser);
            localStorage.setItem('registered_users', JSON.stringify(storedUsers));

            // Sync with backend
            const syncedUser = await syncUserWithBackend(newUser);
            const finalUser = { ...newUser, ...syncedUser };
            delete finalUser.password;

            setUser(finalUser);
            localStorage.setItem('user', JSON.stringify(finalUser));
            logActivity('Signed Up New Account');

            return { success: true };
        } catch (error) {
            console.error("Signup failed", error);
            return { success: false, message: 'Registration failed due to storage error.' };
        }
    };

    const logout = () => {
        logActivity('Logged Out');
        setUser(null);
        localStorage.removeItem('user');
    };

    const updateUser = (data) => {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Also update in registered_users
        const storedUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
        const updatedUsers = storedUsers.map(u => u.id === user.id ? { ...u, ...data } : u);
        localStorage.setItem('registered_users', JSON.stringify(updatedUsers));
    };

    return (
        <AuthContext.Provider value={{ user, login, loginWithGoogle, signup, logout, updateUser, logActivity, loading }}>
            {loading ? (
                <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fcf4ec' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'spin 2s linear infinite' }}>🥥</div>
                    <div style={{ color: '#5D4037', fontWeight: 'bold' }}>Loading Nature Pledge...</div>
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};
