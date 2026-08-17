import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { downloadInvoice } from '../services/invoice';

export default function Profile() {
  const { user, profile, loading: authLoading, openAuthModal, signOut, refreshProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'orders'

  // Settings form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pin, setPin] = useState('');
  const [state, setState] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null); // { text, type: 'error' | 'success' }

  // Orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setEmail(profile.email || user?.email || '');
      setPhone(profile.phone || '');
      setAddress(profile.default_address || '');
      setCity(profile.default_city || '');
      setPin(profile.default_pin || '');
      setState(profile.default_state || '');
    } else if (user) {
      setEmail(user.email || '');
      setFullName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');
      setPhone(user.user_metadata?.phone || '');
    }
  }, [profile, user]);

  useEffect(() => {
    if (activeTab === 'orders' && user) {
      fetchUserOrders();
    }
  }, [activeTab, user]);

  const fetchUserOrders = async () => {
    if (!user?.email) return;
    setOrdersLoading(true);
    try {
      const { data: userOrders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', user.email.toLowerCase())
        .order('created_at', { ascending: false });

      if (!error && userOrders) {
        // Fetch order items for each order
        const orderIds = userOrders.map((o) => o.id);
        let itemsMap = {};
        if (orderIds.length > 0) {
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .in('order_id', orderIds);

          if (items) {
            items.forEach((item) => {
              if (!itemsMap[item.order_id]) itemsMap[item.order_id] = [];
              itemsMap[item.order_id].push(item);
            });
          }
        }

        const fullOrders = userOrders.map((o) => ({
          ...o,
          items: itemsMap[o.id] || [],
        }));

        setOrders(fullOrders);
      }
    } catch (err) {
      console.warn('Orders fetch notice:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setSaveMsg({ text: 'Name and email are required.', type: 'error' });
      return;
    }

    setSaving(true);
    setSaveMsg(null);

    try {
      if (user?.id) {
        const { error } = await supabase.from('user_profiles').upsert(
          {
            auth_user_id: user.id,
            email: email.trim().toLowerCase(),
            full_name: fullName.trim(),
            phone: phone.trim(),
            default_address: address.trim(),
            default_city: city.trim(),
            default_pin: pin.trim(),
            default_state: state.trim(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'auth_user_id' }
        );

        if (error) throw error;

        // Update localStorage cache
        const cache = {
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          pin: pin.trim(),
          state: state.trim(),
        };
        localStorage.setItem('rh_user_profile', JSON.stringify(cache));

        await refreshProfile();
        setSaveMsg({ text: '✅ Profile & default address updated successfully!', type: 'success' });
      }
    } catch (err) {
      console.error('Profile save error:', err);
      setSaveMsg({ text: `❌ ${err.message || 'Error saving profile.'}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', color: '#8B5E3C' }}>
        <span className="rh-spinner"></span> Loading user profile…
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', background: '#FDF6EC' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🏺</div>
        <h2 style={{ fontSize: '26px', color: '#3B2A1A', marginBottom: '12px' }}>Customer Account Access</h2>
        <p style={{ fontSize: '16px', color: '#8B5E3C', maxWidth: '480px', margin: '0 auto 28px', lineHeight: '1.6' }}>
          Sign in to view your profile details, default shipping address, track active orders, and view order invoices.
        </p>
        <button className="btn btn-dark" onClick={() => openAuthModal('login')} type="button">
          Sign In / Create Account →
        </button>
      </div>
    );
  }

  const displayName = fullName || user.email.split('@')[0];
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div style={{ background: '#FDF6EC', minHeight: '80vh', paddingBottom: '60px' }}>
      {/* PROFILE HERO */}
      <div
        style={{
          background: 'linear-gradient(135deg, #3B2A1A 0%, #5C3D1E 100%)',
          padding: '40px 24px',
          color: '#F5ECD7',
          borderBottom: '3px solid #C49A6C',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#C49A6C',
              color: '#3B2A1A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 'bold',
              border: '2px solid #FDF6EC',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', color: '#FDF6EC' }}>{displayName}</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#C49A6C' }}>{user.email}</p>
          </div>
          <button
            onClick={signOut}
            style={{
              marginLeft: 'auto',
              background: 'rgba(196,154,108,0.2)',
              border: '1px solid rgba(196,154,108,0.4)',
              color: '#F5ECD7',
              padding: '8px 18px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
            type="button"
          >
            Sign Out 🚪
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div style={{ background: '#F5ECD7', borderBottom: '1px solid #E8D5B7' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex' }}>
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              padding: '16px 24px',
              border: 'none',
              background: 'none',
              fontSize: '14px',
              fontWeight: activeTab === 'settings' ? 'bold' : 'normal',
              color: activeTab === 'settings' ? '#3B2A1A' : '#8B5E3C',
              borderBottom: activeTab === 'settings' ? '3px solid #5C3D1E' : 'none',
              cursor: 'pointer',
            }}
            type="button"
          >
            👤 Personal Info &amp; Address
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '16px 24px',
              border: 'none',
              background: 'none',
              fontSize: '14px',
              fontWeight: activeTab === 'orders' ? 'bold' : 'normal',
              color: activeTab === 'orders' ? '#3B2A1A' : '#8B5E3C',
              borderBottom: activeTab === 'orders' ? '3px solid #5C3D1E' : 'none',
              cursor: 'pointer',
            }}
            type="button"
          >
            📦 Order History ({orders.length})
          </button>
        </div>
      </div>

      {/* TAB CONTENT CONTAINER */}
      <div style={{ maxWidth: '900px', margin: '32px auto 0', padding: '0 24px' }}>
        {activeTab === 'settings' ? (
          /* Settings & Address Tab */
          <div className="form-container" style={{ margin: 0, maxWidth: '100%' }}>
            <form onSubmit={handleSaveProfile}>
              <h3 style={{ marginTop: 0, color: '#5C3D1E', marginBottom: '20px', fontSize: '18px' }}>
                1. Personal Details
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <h3 style={{ color: '#5C3D1E', margin: '30px 0 20px 0', fontSize: '18px' }}>
                2. Default Delivery Address
              </h3>

              <div className="form-group">
                <label>Street Address &amp; House No.</label>
                <input
                  type="text"
                  placeholder="Door No, Street Name, Area"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    placeholder="Coimbatore"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Pincode</label>
                  <input
                    type="text"
                    placeholder="641001"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  placeholder="Tamil Nadu"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-brown" disabled={saving}>
                {saving ? 'Saving Changes…' : 'Save Profile Changes 💾'}
              </button>

              {saveMsg && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '12px',
                    borderRadius: '6px',
                    background: saveMsg.type === 'success' ? '#d4edda' : '#f8d7da',
                    color: saveMsg.type === 'success' ? '#155724' : '#721c24',
                    textAlign: 'center',
                    fontSize: '14px',
                  }}
                >
                  {saveMsg.text}
                </div>
              )}
            </form>
          </div>
        ) : (
          /* Order History Tab */
          <div>
            {ordersLoading ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8B5E3C' }}>
                <span className="rh-spinner"></span> Loading your orders…
              </div>
            ) : orders.length === 0 ? (
              <div
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '50px 20px',
                  textAlign: 'center',
                  border: '1px solid #E8D5B7',
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                <h3 style={{ fontSize: '20px', color: '#3B2A1A', marginBottom: '8px' }}>No orders yet</h3>
                <p style={{ color: '#8B5E3C', fontSize: '15px', margin: 0 }}>
                  When you purchase kitchenware, your orders will appear here for tracking &amp; invoices.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {orders.map((order) => (
                  <div
                    key={order.id}
                    style={{
                      background: '#fff',
                      borderRadius: '12px',
                      border: '1px solid #E8D5B7',
                      overflow: 'hidden',
                      boxShadow: '0 4px 14px rgba(92,61,30,0.06)',
                    }}
                  >
                    {/* Header */}
                    <div
                      style={{
                        padding: '16px 20px',
                        background: '#F5ECD7',
                        borderBottom: '1px solid #E8D5B7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '15px', color: '#3B2A1A' }}>Order #{order.id}</strong>
                        <span style={{ fontSize: '12px', color: '#8B5E3C', marginLeft: '12px' }}>
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className={`status-badge ${order.order_status || 'pending'}`}>
                          ● {order.order_status || 'pending'}
                        </span>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#5C3D1E' }}>
                          ₹{order.total_amount?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Order Body */}
                    <div style={{ padding: '20px' }}>
                      <div style={{ marginBottom: '14px', fontSize: '13px', color: '#5C3D1E' }}>
                        <strong>Payment:</strong> {order.payment_method} ({order.payment_status || 'pending'})
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '14px',
                                color: '#3B2A1A',
                                borderBottom: '1px dashed #F5ECD7',
                                paddingBottom: '6px',
                              }}
                            >
                              <span>
                                {item.title || item.product_name || 'Handcrafted Kitchenware Item'} × {item.quantity}
                              </span>
                              <strong style={{ marginLeft: 'auto' }}>₹{item.total_price || (item.price * item.quantity)}</strong>
                            </div>
                          ))
                        ) : (
                          <div style={{ fontSize: '13px', color: '#8B5E3C' }}>1x Kitchenware Item</div>
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: '12px',
                          color: '#8B5E3C',
                          background: '#FDF6EC',
                          padding: '10px 14px',
                          borderRadius: '6px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span>
                          <strong>Delivery to:</strong> {order.shipping_address || order.delivery_address || 'Address Not Provided'}, {order.shipping_city || order.city || ''} - {order.shipping_pin || order.pincode || ''}
                        </span>
                        <button
                          onClick={() => {
                            // Format order record with clean nested customer & totals properties for invoice service
                            const formattedOrder = {
                              orderId: order.order_number || order.id,
                              customer: {
                                name: order.customer_name,
                                email: order.customer_email,
                                phone: order.customer_phone,
                                address: order.shipping_address || order.delivery_address,
                                city: order.shipping_city || order.city,
                                pin: order.shipping_pin || order.pincode,
                              },
                              items: order.items.map(it => ({
                                name: it.title || it.product_name,
                                qty: it.quantity,
                                price: it.price,
                              })),
                              grandTotal: order.total_amount,
                              paymentMethod: order.payment_method,
                              totals: {
                                subtotal: order.subtotal || (order.total_amount - (order.shipping_fee || 0)),
                                deliveryFee: order.shipping_fee || 0,
                                tax: Math.round((order.subtotal || order.total_amount) * 0.05),
                                discountAmount: order.discount_amount || 0,
                                grandTotal: order.total_amount,
                              }
                            };
                            downloadInvoice(formattedOrder);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#5C3D1E',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                          type="button"
                        >
                          📄 Printable Invoice
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* PRINTABLE INVOICE MODAL */}
      {selectedInvoiceOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 4000,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelectedInvoiceOrder(null)}
        >
          <div
            style={{
              background: '#fff',
              maxWidth: '600px',
              width: '100%',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              maxHeight: '90vh',
              overflowY: 'auto',
              color: '#3B2A1A',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #5C3D1E', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: 0, color: '#5C3D1E', fontFamily: 'Georgia, serif' }}>🏺 Rustic Heritage</h2>
                <div style={{ fontSize: '11px', color: '#C49A6C', letterSpacing: '2px', textTransform: 'uppercase' }}>KITCHENWARE INVOICE</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '13px' }}>
                <strong>INVOICE #{selectedInvoiceOrder.id}</strong>
                <div>Date: {new Date(selectedInvoiceOrder.created_at).toLocaleDateString('en-IN')}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '13px', marginBottom: '20px' }}>
              <div>
                <strong style={{ color: '#8B5E3C' }}>Billed &amp; Shipped To:</strong>
                <div>{selectedInvoiceOrder.customer_name}</div>
                <div>{selectedInvoiceOrder.customer_email}</div>
                <div>{selectedInvoiceOrder.customer_phone}</div>
                <div>{selectedInvoiceOrder.shipping_address}, {selectedInvoiceOrder.shipping_city}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ color: '#8B5E3C' }}>Payment Info:</strong>
                <div>Method: {selectedInvoiceOrder.payment_method}</div>
                <div>Status: {selectedInvoiceOrder.payment_status}</div>
                <div>Ref ID: {selectedInvoiceOrder.payment_id || `COD-${selectedInvoiceOrder.id}`}</div>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
              <thead>
                <tr style={{ background: '#F5ECD7', color: '#5C3D1E' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Item</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoiceOrder.items && selectedInvoiceOrder.items.length > 0 ? (
                  selectedInvoiceOrder.items.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #E8D5B7' }}>
                      <td style={{ padding: '8px' }}>{item.product_name}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>₹{item.total_price}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ padding: '8px' }}>Kitchenware Item</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div style={{ textAlign: 'right', fontSize: '15px', fontWeight: 'bold', color: '#5C3D1E', marginBottom: '24px' }}>
              Total Amount: ₹{selectedInvoiceOrder.total_amount?.toLocaleString('en-IN')}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => window.print()}
                style={{ padding: '8px 18px', background: '#5C3D1E', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                type="button"
              >
                🖨️ Print Invoice
              </button>
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                style={{ padding: '8px 18px', background: '#ccc', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
