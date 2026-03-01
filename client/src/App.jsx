import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import Admin from './pages/Admin';

import { ToastProvider } from './context/ToastContext';

import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import OrderTracking from './pages/OrderTracking';

import { CartProvider } from './context/CartContext';
import { useAuth } from './context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // Or a loading spinner

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.email !== 'tilakmishra.76@gmail.com' && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <div className="app-container">
      <GoogleOAuthProvider clientId="1027989354024-r8p9p3n4v8v4p3n4v8v4p3n4v8v4p3n4.apps.googleusercontent.com">
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <Navbar />
              <div style={{ minHeight: '80vh' }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/cart" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                  <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                  <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/track-order" element={<OrderTracking />} />
                  <Route path="*" element={<div style={{ padding: '4rem', textAlign: 'center' }}><h2>Page Not Found</h2><p>The page you are looking for does not exist.</p><a href="/" style={{ color: '#5D4037', textDecoration: 'underline' }}>Go Home</a></div>} />
                </Routes>
              </div>
              <ChatWidget />
              <Footer />
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </div>
  );
}

export default App;
