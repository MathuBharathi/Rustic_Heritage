import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../services/products';
import { validateCoupon } from '../services/payment';

export default function CartDrawer() {
  const {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    tax,
    discountAmount,
    grandTotal,
    appliedCoupon,
    cartDrawerOpen,
    closeCartDrawer,
    addItem,
    removeItem,
    deleteItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    openCheckoutModal,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState(null); // { text, type: 'error' | 'success' | 'info' }
  const [couponLoading, setCouponLoading] = useState(false);

  if (!cartDrawerOpen) return null;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMsg({ text: 'Enter a coupon code', type: 'error' });
      return;
    }
    setCouponLoading(true);
    setCouponMsg({ text: 'Validating…', type: 'info' });

    try {
      const res = await validateCoupon(couponCode, subtotal);
      applyCoupon(res.coupon);
      const freeTxt = res.coupon?.free_delivery ? ' + Free delivery!' : '';
      setCouponMsg({
        text: `✅ Coupon applied! You save ₹${res.discountAmount}${freeTxt}`,
        type: 'success',
      });
    } catch (err) {
      setCouponMsg({ text: `❌ ${err.message || 'Invalid coupon'}`, type: 'error' });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponCode('');
    setCouponMsg(null);
  };



  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3000,
        background: 'rgba(30, 15, 5, 0.65)',
        display: 'flex',
        justifyContent: 'flex-end',
        transition: 'opacity 0.3s ease',
        fontFamily: "'Georgia', serif",
      }}
      onClick={closeCartDrawer}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          background: '#FDF6EC',
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderLeft: '2px solid #C49A6C',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #3B2A1A 0%, #5C3D1E 100%)',
            padding: '20px 24px',
            color: '#F5ECD7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #C49A6C',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#FDF6EC', fontWeight: 'bold' }}>
              🛒 Shopping Cart
            </h3>
            <span style={{ fontSize: '12px', color: '#C49A6C' }}>
              {itemCount} {itemCount === 1 ? 'item' : 'items'} selected
            </span>
          </div>
          <button
            onClick={closeCartDrawer}
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



        {/* Drawer Body - Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {itemCount === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8B5E3C' }}>
              <div style={{ fontSize: '54px', marginBottom: '16px' }}>🏺</div>
              <h4 style={{ fontSize: '18px', color: '#3B2A1A', marginBottom: '8px' }}>Your cart is empty</h4>
              <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                Explore our traditional Indian kitchenware collection and bring home timeless craft.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Object.entries(items).map(([idStr, qty]) => {
                const id = Number(idStr);
                const p = PRODUCTS.find((item) => item.id === id);
                if (!p) return null;
                return (
                  <div
                    key={id}
                    style={{
                      display: 'flex',
                      gap: '14px',
                      background: '#fff',
                      padding: '14px',
                      borderRadius: '8px',
                      border: '1px solid #E8D5B7',
                      boxShadow: '0 2px 8px rgba(92,61,30,0.06)',
                    }}
                  >
                    <img
                      src={p.img}
                      alt={p.name}
                      style={{
                        width: '70px',
                        height: '70px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                        border: '1px solid #E8D5B7',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4
                        style={{
                          margin: '0 0 4px 0',
                          fontSize: '14px',
                          color: '#3B2A1A',
                          lineHeight: '1.3',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {p.emoji} {p.name}
                      </h4>
                      <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#8B5E3C', marginBottom: '8px' }}>
                        ₹{p.price}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            border: '1px solid #E8D5B7',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            background: '#FDF6EC',
                          }}
                        >
                          <button
                            onClick={() => removeItem(id)}
                            style={{
                              padding: '2px 10px',
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              fontSize: '14px',
                              color: '#5C3D1E',
                            }}
                            type="button"
                          >
                            -
                          </button>
                          <span style={{ padding: '0 8px', fontSize: '13px', fontWeight: 'bold', color: '#3B2A1A' }}>
                            {qty}
                          </span>
                          <button
                            onClick={() => addItem(id)}
                            style={{
                              padding: '2px 10px',
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              fontSize: '14px',
                              color: '#5C3D1E',
                            }}
                            type="button"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => deleteItem(id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#e57373',
                            cursor: 'pointer',
                            fontSize: '14px',
                          }}
                          title="Remove item"
                          type="button"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div style={{ textAlign: 'right', marginTop: '4px' }}>
                <button
                  onClick={clearCart}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#8b1a1a',
                    fontSize: '12px',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                  type="button"
                >
                  Clear entire cart
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer - Summary & Coupon */}
        {itemCount > 0 && (
          <div
            style={{
              padding: '20px 24px',
              background: '#F5ECD7',
              borderTop: '2px solid #E8D5B7',
            }}
          >
            {/* Coupon Code input */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Coupon code (e.g. WELCOME-XXXX)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={!!appliedCoupon || couponLoading}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1.5px solid #E8D5B7',
                    borderRadius: '4px',
                    fontSize: '13px',
                    outline: 'none',
                    textTransform: 'uppercase',
                    background: '#fff',
                  }}
                />
                {appliedCoupon ? (
                  <button
                    onClick={handleRemoveCoupon}
                    style={{
                      padding: '8px 14px',
                      background: '#e57373',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                    type="button"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    style={{
                      padding: '8px 16px',
                      background: '#3B2A1A',
                      color: '#F5ECD7',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                    type="button"
                  >
                    {couponLoading ? '…' : 'Apply'}
                  </button>
                )}
              </div>
              {couponMsg && (
                <div
                  style={{
                    fontSize: '12px',
                    marginTop: '6px',
                    color: couponMsg.type === 'error' ? '#8b1a1a' : '#1a5c34',
                  }}
                >
                  {couponMsg.text}
                </div>
              )}
            </div>

            {/* Calculations */}
            <div style={{ fontSize: '13px', color: '#5C3D1E', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1a5c34', fontWeight: 'bold' }}>
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? <strong style={{ color: '#1a5c34' }}>FREE</strong> : `₹${deliveryFee}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>GST (5%)</span>
                <span>₹{tax}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justify: 'space-between',
                  fontSize: '17px',
                  fontWeight: 'bold',
                  color: '#3B2A1A',
                  borderTop: '1px solid #E8D5B7',
                  paddingTop: '8px',
                  marginTop: '4px',
                }}
              >
                <span>Total</span>
                <span style={{ color: '#8B5E3C' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={openCheckoutModal}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #3B2A1A, #5C3D1E)',
                color: '#F5ECD7',
                border: 'none',
                borderRadius: '6px',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: 'pointer',
                letterSpacing: '1px',
                transition: 'all 0.2s ease',
              }}
              type="button"
            >
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
