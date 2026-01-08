import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for existing session
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user session", error);
            localStorage.removeItem('user');
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        // Mock Login Logic with simulated latency
        return new Promise((resolve) => {
            setTimeout(() => {
                try {
                    const storedUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
                    const safeUsers = Array.isArray(storedUsers) ? storedUsers : [];
                    const foundUser = safeUsers.find(u => u.email === email && u.password === password);

                    if (foundUser) {
                        const userData = { ...foundUser };
                        delete userData.password; // Don't keep password in session
                        setUser(userData);
                        localStorage.setItem('user', JSON.stringify(userData));
                        resolve({ success: true });
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

    const signup = (userData) => {
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
                walletBalance: 0, // Initial wallet balance
                walletHistory: []
            };

            storedUsers.push(newUser);
            localStorage.setItem('registered_users', JSON.stringify(storedUsers));

            // Auto login
            const sessionUser = { ...newUser };
            delete sessionUser.password;
            setUser(sessionUser);
            localStorage.setItem('user', JSON.stringify(sessionUser));

            return { success: true };
        } catch (error) {
            console.error("Signup failed", error);
            return { success: false, message: 'Registration failed due to storage error.' };
        }
    };

    const logout = () => {
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
        <AuthContext.Provider value={{ user, login, signup, logout, updateUser, loading }}>
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
