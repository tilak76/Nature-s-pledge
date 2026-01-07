import React, { createContext, useContext, useState, useEffect } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    background: toast.type === 'success' ? '#4CAF50' : '#F44336',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    transform: 'translateY(0)',
                    transition: 'all 0.3s ease',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span>{toast.type === 'success' ? '✅' : '⚠️'}</span>
                    {toast.message}
                </div>
            )}
        </ToastContext.Provider>
    );
};
