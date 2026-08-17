import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { processOrderPayment } from '../services/payment';
import { downloadInvoice } from '../services/invoice';
import { useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../services/products';

export default function CheckoutModal() {
  const { user, profile } = useAuth();
  const {
    items,
    subtotal,
    deliveryFee,
    tax,
    discountAmount,
    grandTotal,
    appliedCoupon,
    checkoutModalOpen,
    closeCheckoutModal,
    clearCart,
  } = useCart();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pin, setPin] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // Default to COD

  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Auto-fill from profile or localStorage cache
  useEffect(() => {
    if (profile) {
      if (profile.full_name) setName(profile.full_name);
      if (profile.email) setEmail(profile.email);
      if (profile.phone) setPhone(profile.phone);
      if (profile.default_address) setAddress(profile.default_address);
      if (profile.default_city) setCity(profile.default_city);
      if (profile.default_pin) setPin(profile.default_pin);
      if (profile.default_state) setState(profile.default_state);
    } else if (user) {
      if (user.email) setEmail(user.email);
      if (user.user_metadata?.full_name) setName(user.user_metadata.full_name);
      if (user.user_metadata?.phone) setPhone(user.user_metadata.phone);
    } else {
      try {
        const cache = JSON.parse(localStorage.getItem('rh_user_profile') || '{}');
        if (cache.name) setName(cache.name);
        if (cache.email) setEmail(cache.email);
        if (cache.phone) setPhone(cache.phone);
        if (cache.address) setAddress(cache.address);
        if (cache.city) setCity(cache.city);
        if (cache.pin) setPin(cache.pin);
        if (cache.state) setState(cache.state);
      } catch (e) {}
    }
  }, [profile, user, checkoutModalOpen]);

  if (!checkoutModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim() || !city.trim() || !pin.trim()) {
      setErrorMsg('Please complete all delivery address fields.');
      return;
    }

    setProcessing(true);

    try {
      const customer = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        pin: pin.trim(),
        state: state.trim(),
      };

      const result = await processOrderPayment({
        cartItems: items,
        customer,
        paymentMethod,
        totals: { subtotal, deliveryFee, tax, discountAmount, grandTotal },
        appliedCoupon,
      });

      // Map dictionary to list of real product items with name and price
      const detailedItems = Object.keys(items).map(id => {
        const prod = PRODUCTS.find(p => p.id === Number(id));
        return {
          id: Number(id),
          name: prod ? prod.name : 'Handcrafted Kitchenware Item',
          price: prod ? prod.price : 0,
          qty: items[id],
        };
      });

      const savedTotals = { subtotal, deliveryFee, tax, discountAmount, grandTotal };
      const savedCoupon = appliedCoupon;

      // Clear cart ONLY AFTER successful order creation
      clearCart();
      setOrderSuccess({
        ...result,
        items: detailedItems,
        paymentMethod,
        totals: savedTotals,
        appliedCoupon: savedCoupon,
        grandTotal: savedTotals.grandTotal,
      });
    } catch (err) {
      console.error('Payment/Checkout error:', err);
      setErrorMsg(err.message || 'Unable to place your order right now. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDone = () => {
    setOrderSuccess(null);
    closeCheckoutModal();
    if (user) {
      navigate('/profile');
    } else {
      navigate('/');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3500,
        background: 'rgba(30, 15, 5, 0.65)',
        display: 'flex',
        justifyContent: 'flex-end', // Aligns checkout panel to right side!
        fontFamily: "'Georgia', serif",
      }}
      onClick={closeCheckoutModal}
    >
      <div
        style={{
          background: '#FDF6EC',
          width: '100%',
          maxWidth: '460px', // Exact right-side panel width matching Cart Drawer!
          height: '100vh',
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '4px solid #C49A6C',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #3B2A1A 0%, #5C3D1E 100%)',
            padding: '20px 24px',
            color: '#F5ECD7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#FDF6EC', fontWeight: 'bold' }}>
              {orderSuccess ? '🎉 Order Placed Successfully' : '📦 Checkout & Delivery'}
            </h3>
            <span style={{ fontSize: '11px', color: '#C49A6C', letterSpacing: '2px', textTransform: 'uppercase' }}>
              RUSTIC HERITAGE KITCHENWARE
            </span>
          </div>
          <button
            onClick={closeCheckoutModal}
            style={{
              background: 'rgba(196, 154, 108, 0.2)',
              border: '1px solid rgba(196, 154, 108, 0.4)',
              color: '#C49A6C',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '16px',
            }}
            type="button"
          >
            ✕
          </button>
        </div>

        {orderSuccess ? (
          /* Order Confirmation View */
          <div style={{ padding: '28px 24px', textAlign: 'center', overflowY: 'auto', flex: 1 }}>
            <div style={{ fontSize: '52px', marginBottom: '12px' }}>✨</div>
            <h3 style={{ fontSize: '20px', color: '#3B2A1A', marginBottom: '8px' }}>
              Order Placed Successfully!
            </h3>
            <p style={{ fontSize: '13px', color: '#8B5E3C', lineHeight: '1.6', marginBottom: '20px' }}>
              Your order <strong>#{orderSuccess.orderId}</strong> is confirmed.
            </p>

            <div
              style={{
                background: '#F5ECD7',
                border: '1.5px dashed #C49A6C',
                borderRadius: '8px',
                padding: '18px',
                textAlign: 'left',
                marginBottom: '20px',
                fontSize: '13px',
                color: '#3B2A1A',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#8B5E3C' }}>Order Ref:</span>
                <strong>#{orderSuccess.orderId}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#8B5E3C' }}>Payment Method:</span>
                <strong>{orderSuccess.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Online Payment'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#8B5E3C' }}>Total Amount:</span>
                <strong style={{ color: '#5C3D1E', fontSize: '15px' }}>
                  ₹{orderSuccess.grandTotal.toLocaleString('en-IN')}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8B5E3C' }}>Delivery Address:</span>
                <strong style={{ textAlign: 'right', maxWidth: '200px' }}>
                  {orderSuccess.customer.address}, {orderSuccess.customer.city}
                </strong>
              </div>
            </div>

            <button
              onClick={() => downloadInvoice(orderSuccess)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#F5ECD7',
                color: '#3B2A1A',
                border: '1.5px solid #C49A6C',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '12px',
              }}
              type="button"
            >
              📄 Download Invoice (PDF/Print)
            </button>

            <button
              onClick={handleDone}
              style={{
                width: '100%',
                padding: '14px',
                background: '#3B2A1A',
                color: '#F5ECD7',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
              type="button"
            >
              View My Orders &amp; Account →
            </button>
          </div>
        ) : (
          /* Checkout Form View */
          <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
            {errorMsg && (
              <div
                style={{
                  background: '#ffebee',
                  color: '#c62828',
                  padding: '12px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  marginBottom: '18px',
                  border: '1px solid #ef9a9a',
                }}
              >
                ❌ {errorMsg}
              </div>
            )}

            {/* Delivery Details Section */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#5C3D1E', letterSpacing: '1px', textTransform: 'uppercase' }}>
                1. Delivery Address
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#8B5E3C', marginBottom: '4px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Ramesh"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 10px',
                      border: '1.5px solid #E8D5B7',
                      borderRadius: '4px',
                      fontSize: '13px',
                      outline: 'none',
                      background: '#fff',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#8B5E3C', marginBottom: '4px' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 10px',
                      border: '1.5px solid #E8D5B7',
                      borderRadius: '4px',
                      fontSize: '13px',
                      outline: 'none',
                      background: '#fff',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#8B5E3C', marginBottom: '4px' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 10px',
                    border: '1.5px solid #E8D5B7',
                    borderRadius: '4px',
                    fontSize: '13px',
                    outline: 'none',
                    background: '#fff',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#8B5E3C', marginBottom: '4px' }}>
                  Street Address &amp; House/Flat No. *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Door No, Street Name, Area"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 10px',
                    border: '1.5px solid #E8D5B7',
                    borderRadius: '4px',
                    fontSize: '13px',
                    outline: 'none',
                    background: '#fff',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#8B5E3C', marginBottom: '4px' }}>
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Coimbatore"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 10px',
                      border: '1.5px solid #E8D5B7',
                      borderRadius: '4px',
                      fontSize: '13px',
                      outline: 'none',
                      background: '#fff',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#8B5E3C', marginBottom: '4px' }}>
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="641001"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 10px',
                      border: '1.5px solid #E8D5B7',
                      borderRadius: '4px',
                      fontSize: '13px',
                      outline: 'none',
                      background: '#fff',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#8B5E3C', marginBottom: '4px' }}>
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="Tamil Nadu"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 10px',
                      border: '1.5px solid #E8D5B7',
                      borderRadius: '4px',
                      fontSize: '13px',
                      outline: 'none',
                      background: '#fff',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Section */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#5C3D1E', letterSpacing: '1px', textTransform: 'uppercase' }}>
                2. Select Payment Method
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    background: paymentMethod === 'cod' ? '#F5ECD7' : '#fff',
                    border: `1.5px solid ${paymentMethod === 'cod' ? '#5C3D1E' : '#E8D5B7'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    accentColor="#5C3D1E"
                  />
                  <div>
                    <strong style={{ display: 'block', fontSize: '13px', color: '#3B2A1A' }}>
                      💵 Cash on Delivery (COD)
                    </strong>
                    <span style={{ fontSize: '11px', color: '#8B5E3C' }}>
                      Pay with cash upon delivery at your doorstep
                    </span>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    background: paymentMethod === 'razorpay' ? '#F5ECD7' : '#fff',
                    border: `1.5px solid ${paymentMethod === 'razorpay' ? '#5C3D1E' : '#E8D5B7'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    accentColor="#5C3D1E"
                  />
                  <div>
                    <strong style={{ display: 'block', fontSize: '13px', color: '#3B2A1A' }}>
                      💳 Online Payment (Razorpay UPI, Cards)
                    </strong>
                    <span style={{ fontSize: '11px', color: '#8B5E3C' }}>
                      Instant confirmation via GPay, PhonePe, Cards &amp; Netbanking
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Order Total Summary */}
            <div
              style={{
                background: '#F5ECD7',
                padding: '14px',
                borderRadius: '6px',
                border: '1px solid #E8D5B7',
                marginBottom: '20px',
                fontSize: '13px',
                color: '#3B2A1A',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1a5c34', marginBottom: '4px' }}>
                  <span>Discount</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>GST (5%)</span>
                <span>₹{tax}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Delivery</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  color: '#5C3D1E',
                  borderTop: '1px solid #E8D5B7',
                  paddingTop: '6px',
                  marginTop: '4px',
                }}
              >
                <span>Grand Total</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #3B2A1A, #5C3D1E)',
                color: '#F5ECD7',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: processing ? 'not-allowed' : 'pointer',
                opacity: processing ? 0.7 : 1,
              }}
            >
              {processing ? 'Processing Order…' : `Complete Order (₹${grandTotal.toLocaleString('en-IN')}) →`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
