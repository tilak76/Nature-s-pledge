import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for existing session
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (email, password) => {
        // Mock Login Logic
        // In a real app, this would verify with backend
        const storedUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
        const foundUser = storedUsers.find(u => u.email === email && u.password === password);

        if (foundUser) {
            const userData = { ...foundUser };
            delete userData.password; // Don't keep password in session
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return { success: true };
        }
        return { success: false, message: 'Invalid credentials' };
    };

    const signup = (userData) => {
        // Mock Signup Logic
        const storedUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');

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
            {!loading && children}
        </AuthContext.Provider>
    );
};
