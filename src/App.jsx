import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AdminRoute from './components/AdminRoute';

import Home from './pages/Home';
import Products from './pages/Products';
import Reviews from './pages/Reviews';
import GetInTouch from './pages/GetInTouch';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

function AppLayout() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const { toastMessage } = useCart();

  return (
    <div className={isAdminPage ? 'admin-page' : 'storefront-page'}>
      {/* Show Navbar & Footer for storefront routes */}
      {!isAdminPage && <Navbar />}

      {/* Global Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            background: '#3B2A1A',
            color: '#F5ECD7',
            padding: '12px 20px',
            borderRadius: '30px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            border: '1.5px solid #C49A6C',
            fontSize: '14px',
            fontWeight: 'bold',
            fontFamily: "'Georgia', serif",
            animation: 'heroFadeIn 0.3s ease',
          }}
        >
          {toastMessage}
        </div>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/customer-stories" element={<Reviews />} />
        <Route path="/getintouch" element={<GetInTouch />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Home />} />
      </Routes>

      {!isAdminPage && <Footer />}

      {/* Global Modals & Drawers */}
      <AuthModal />
      <CartDrawer />
      <CheckoutModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppLayout />
      </CartProvider>
    </AuthProvider>
  );
}
