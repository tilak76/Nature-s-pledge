import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    // Load cart from local storage on init (Lazy Initialization)
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            const parsedCart = savedCart ? JSON.parse(savedCart) : [];
            // Ensure strictly it's an array of objects with IDs
            if (!Array.isArray(parsedCart)) return [];
            return parsedCart.filter(item => item && typeof item === 'object' && item.id);
        } catch (error) {
            console.error("Failed to parse cart from local storage", error);
            localStorage.removeItem('cart');
            return [];
        }
    });

    // Save cart to local storage on change
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        if (!product || !product.id) return;
        setCart(prevCart => {
            const safeCart = Array.isArray(prevCart) ? prevCart : [];
            const existingItem = safeCart.find(item => item.id === product.id);
            if (existingItem) {
                return safeCart.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...safeCart, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => {
            const safeCart = Array.isArray(prevCart) ? prevCart : [];
            return safeCart.filter(item => item.id !== productId);
        });
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) return;
        setCart(prevCart => {
            const safeCart = Array.isArray(prevCart) ? prevCart : [];
            return safeCart.map(item =>
                item.id === productId ? { ...item, quantity } : item
            );
        });
    };

    const clearCart = () => setCart([]);

    // Safely calculate total
    const safeCart = Array.isArray(cart) ? cart : [];
    const cartTotal = safeCart.reduce((total, item) => {
        const price = parseFloat(item.price) || 0;
        const qty = parseInt(item.quantity) || 1;
        return total + (price * qty);
    }, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
};
