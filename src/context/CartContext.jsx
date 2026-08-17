import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS } from '../services/products';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('rh_cart') || '{}');
    } catch {
      return {};
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('rh_cart', JSON.stringify(items));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }, [items]);

  const showToast = (productName) => {
    setToastMessage(`✓ "${productName}" added to cart!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const addItem = (id) => {
    setItems((prev) => {
      const next = { ...prev, [id]: (prev[id] || 0) + 1 };
      return next;
    });
    const prod = PRODUCTS.find((p) => p.id === id);
    if (prod) showToast(prod.name);
  };

  const removeItem = (id) => {
    setItems((prev) => {
      const next = { ...prev };
      if (next[id] > 1) {
        next[id] -= 1;
      } else {
        delete next[id];
      }
      return next;
    });
  };

  const deleteItem = (id) => {
    setItems((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const clearCart = () => {
    setItems({});
    setAppliedCoupon(null);
  };

  const itemCount = Object.values(items).reduce((a, b) => a + b, 0);

  const subtotal = PRODUCTS.reduce((sum, p) => sum + p.price * (items[p.id] || 0), 0);

  const deliveryFee = (() => {
    if (subtotal === 0) return 0;
    return subtotal >= 999 ? 40 : 80;
  })();

  const tax = Math.round(subtotal * 0.05);

  const discountAmount = (() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discount_type === 'percentage') {
      let amt = Math.round((subtotal * appliedCoupon.discount_value) / 100);
      if (appliedCoupon.maximum_discount) {
        amt = Math.min(amt, appliedCoupon.maximum_discount);
      }
      return amt;
    }
    return Math.min(appliedCoupon.discount_value, subtotal);
  })();

  const grandTotal = Math.max(0, subtotal + deliveryFee + tax - discountAmount);

  const applyCoupon = (coupon) => {
    setAppliedCoupon(coupon);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const openCartDrawer = () => setCartDrawerOpen(true);
  const closeCartDrawer = () => setCartDrawerOpen(false);

  const openCheckoutModal = () => {
    setCartDrawerOpen(false);
    setCheckoutModalOpen(true);
  };
  const closeCheckoutModal = () => setCheckoutModalOpen(false);

  const value = {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    tax,
    discountAmount,
    grandTotal,
    appliedCoupon,
    cartDrawerOpen,
    checkoutModalOpen,
    toastMessage,
    addItem,
    removeItem,
    deleteItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    openCartDrawer,
    closeCartDrawer,
    openCheckoutModal,
    closeCheckoutModal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
