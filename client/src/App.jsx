import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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

function App() {
  return (
    <div className="app-container">
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <Navbar />
            <div style={{ minHeight: '80vh' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Checkout />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/track-order" element={<OrderTracking />} />
              </Routes>
            </div>
            <Footer />
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
