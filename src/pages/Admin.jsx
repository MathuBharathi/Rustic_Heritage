import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

import AdminLayout from '../admin/AdminLayout';
import AdminDashboard from '../admin/AdminDashboard';
import AdminOrders from '../admin/AdminOrders';
import AdminPendingOrders from '../admin/AdminPendingOrders';
import AdminProducts from '../admin/AdminProducts';
import AdminReviews from '../admin/AdminReviews';
import AdminEnquiries from '../admin/AdminEnquiries';
import AdminSubscribers from '../admin/AdminSubscribers';
import AdminCoupons from '../admin/AdminCoupons';
import AdminUsers from '../admin/AdminUsers';
import { PRODUCTS } from '../services/products';
import { fetchAllOrders, updateOrderStatus } from '../services/orders';
import { fetchAllReviews, toggleReviewApproval } from '../services/reviews';
import { fetchEnquiries } from '../services/enquiries';
import { fetchSubscribers } from '../services/newsletter';

export default function Admin() {
  const { user, isAdmin, signOut, refreshProfile } = useAuth();

  // Admin login form state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginErr, setLoginErr] = useState(null);

  // Active admin tab
  const [activeTab, setActiveTab] = useState('dashboard');

  // Data states
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState(PRODUCTS);
  const [reviews, setReviews] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [users, setUsers] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Modals & Drawers
  const [selectedOrderDrawer, setSelectedOrderDrawer] = useState(null);
  const [selectedEnquiryDrawer, setSelectedEnquiryDrawer] = useState(null);
  const [couponModal, setCouponModal] = useState(false);
  const [couponFormData, setCouponFormData] = useState({ code: '', discount_type: 'percentage', discount_value: '15', minimum_order: '299' });

  const [actionMsg, setActionMsg] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      loadAllAdminData();
    }
  }, [isAdmin]);

  const loadAllAdminData = async () => {
    setDataLoading(true);
    try {
      const ordersData = await fetchAllOrders();
      setOrders(ordersData);

      const reviewsData = await fetchAllReviews();
      setReviews(reviewsData);

      const enquiriesData = await fetchEnquiries();
      setEnquiries(enquiriesData);

      const subscribersData = await fetchSubscribers();
      setSubscribers(subscribersData);

      const { data: couponsData } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if (couponsData) setCoupons(couponsData);

      const { data: productsData } = await supabase.from('products').select('*').order('id', { ascending: true });
      if (productsData && productsData.length > 0) setProducts(productsData);

      const { data: usersData } = await supabase.from('user_profiles').select('*').order('created_at', { ascending: false });
      if (usersData) setUsers(usersData);
    } catch (err) {
      console.warn('Admin data load notice:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginErr(null);
    setLoginLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: adminEmail.trim().toLowerCase(),
        password: adminPassword,
      });
      if (error) throw error;
      await refreshProfile();
    } catch (err) {
      console.error('Admin login error:', err);
      setLoginErr(err.message || 'Authentication failed. Check credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o)));
      setSelectedOrderDrawer(null); // Auto-close modal popup after changing status!
      showActionMsg(`✅ Order #${orderId} status updated to ${newStatus}`);
    } catch (err) {
      alert(`Error updating order: ${err.message}`);
    }
  };

  const handleToggleReviewApprove = async (reviewId, currentApproved, explicitTarget) => {
    try {
      const targetApproved = explicitTarget ? explicitTarget === 'approved' : !currentApproved;
      await toggleReviewApproval(reviewId, currentApproved, explicitTarget);
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, approved: targetApproved, status: targetApproved ? 'approved' : 'hidden' }
            : r
        )
      );
      showActionMsg(`✅ Review status set to ${targetApproved ? 'Approved' : 'Hidden'}`);
    } catch (err) {
      alert(`Error updating review: ${err.message}`);
    }
  };

  const handleResendWelcomeEmail = async (sub) => {
    try {
      showActionMsg(`Sending email to ${sub.email}…`);
      const res = await fetch('/api/admin-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resend_welcome_email',
          subscriber_email: sub.email,
          coupon_code: sub.coupon_code || 'WELCOME15',
        }),
      });

      if (res.ok) {
        showActionMsg(`🎉 Resent welcome email to ${sub.email}!`);
      } else {
        const err = await res.json();
        alert(`Could not resend email: ${err.error || 'SMTP Error'}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!couponFormData.code.trim()) return;

    try {
      const { data, error } = await supabase
        .from('coupons')
        .insert({
          code: couponFormData.code.trim().toUpperCase(),
          discount_type: couponFormData.discount_type,
          discount_value: Number(couponFormData.discount_value),
          minimum_order: Number(couponFormData.minimum_order),
          active: true,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setCoupons((prev) => [data, ...prev]);
      setCouponModal(false);
      setCouponFormData({ code: '', discount_type: 'percentage', discount_value: '15', minimum_order: '299' });
      showActionMsg(`✅ Created coupon ${data.code}`);
    } catch (err) {
      alert(`Error creating coupon: ${err.message}`);
    }
  };

  const handleToggleCouponActive = async (couponId, newActiveState) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ active: newActiveState, updated_at: new Date().toISOString() })
        .eq('id', couponId);

      if (error) throw error;

      setCoupons((prev) =>
        prev.map((c) => (c.id === couponId ? { ...c, active: newActiveState } : c))
      );
      showActionMsg(`✅ Coupon status updated to ${newActiveState ? 'Active' : 'Disabled'}`);
    } catch (err) {
      alert(`Error updating coupon: ${err.message}`);
    }
  };

  const handleDeleteCoupon = async (couponId, couponCode) => {
    if (!window.confirm(`Are you sure you want to delete coupon ${couponCode}?`)) return;

    try {
      const { error } = await supabase.from('coupons').delete().eq('id', couponId);
      if (error) throw error;

      setCoupons((prev) => prev.filter((c) => c.id !== couponId));
      showActionMsg(`🗑️ Coupon ${couponCode} deleted successfully`);
    } catch (err) {
      alert(`Error deleting coupon: ${err.message}`);
    }
  };

  const showActionMsg = (msg) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 3500);
  };

  if (!user || !isAdmin) {
    return (
      <div className="admin-login-screen">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <h1>🏺 Rustic Heritage</h1>
            <p>KITCHENWARE ADMIN PANEL</p>
          </div>
          <div className="admin-login-body">
            {loginErr && <div className="admin-login-err" style={{ display: 'block' }}>{loginErr}</div>}
            <form onSubmit={handleAdminLoginSubmit}>
              <div className="admin-login-field">
                <label>Admin Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="Enter Admin Email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                />
              </div>
              <div className="admin-login-field">
                <label>Admin Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter Password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="admin-login-btn" disabled={loginLoading}>
                {loginLoading ? 'Signing in…' : 'Sign In as Admin →'}
              </button>
            </form>
            <div className="admin-login-back">
              <Link to="/">← Back to Customer Storefront</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pendingOrdersCount = orders.filter(
    (o) => (o.order_status || 'pending').toLowerCase() === 'pending'
  ).length;

  return (
    <AdminLayout
      user={user}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      signOut={signOut}
      dataLoading={dataLoading}
      actionMsg={actionMsg}
      ordersCount={orders.length}
      reviewsCount={reviews.length}
      enquiriesCount={enquiries.length}
      subscribersCount={subscribers.length}
      couponsCount={coupons.length}
      usersCount={users.length}
      pendingOrdersCount={pendingOrdersCount}
    >
      {activeTab === 'dashboard' && (
        <AdminDashboard
          orders={orders}
          products={products}
          subscribers={subscribers}
          reviews={reviews}
          users={users}
          onNavigateOrders={() => setActiveTab('orders')}
        />
      )}

      {activeTab === 'users' && (
        <AdminUsers users={users} />
      )}

      {activeTab === 'orders' && (
        <AdminOrders orders={orders} onSelectOrder={setSelectedOrderDrawer} />
      )}

      {activeTab === 'pending_orders' && (
        <AdminPendingOrders orders={orders} onSelectOrder={setSelectedOrderDrawer} />
      )}

      {activeTab === 'reviews' && (
        <AdminReviews reviews={reviews} onToggleApprove={handleToggleReviewApprove} />
      )}

      {activeTab === 'enquiries' && (
        <AdminEnquiries enquiries={enquiries} onSelectEnquiry={setSelectedEnquiryDrawer} />
      )}

      {activeTab === 'subscribers' && (
        <AdminSubscribers subscribers={subscribers} onResendEmail={handleResendWelcomeEmail} />
      )}

      {activeTab === 'coupons' && (
        <AdminCoupons
          coupons={coupons}
          onCreateClick={() => setCouponModal(true)}
          onToggleActive={handleToggleCouponActive}
          onDeleteCoupon={handleDeleteCoupon}
        />
      )}

      {/* ORDER DETAILS DRAWER */}
      {/* ORDER DETAILS POPUP MODAL */}
      {selectedOrderDrawer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 4000,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(3px)',
          }}
          onClick={() => setSelectedOrderDrawer(null)}
        >
          <div
            style={{
              background: '#FFFFFF',
              maxWidth: '560px',
              width: '100%',
              borderRadius: '12px',
              padding: '28px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '2px solid #5C3D1E',
              color: '#3B2A1A',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #5C3D1E', paddingBottom: '14px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#5C3D1E', fontSize: '18px', fontFamily: 'Georgia, serif' }}>
                  Order #{String(selectedOrderDrawer.order_number || selectedOrderDrawer.id).slice(0, 18)}
                </h3>
                <div style={{ fontSize: '11px', color: '#C49A6C', textTransform: 'uppercase', letterSpacing: '1px' }}>Customer Details &amp; Status Update</div>
              </div>
              <button
                onClick={() => setSelectedOrderDrawer(null)}
                style={{
                  background: '#F5ECD7',
                  border: '1px solid #C49A6C',
                  color: '#5C3D1E',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}
                type="button"
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#8B5E3C', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Update Order Status</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['pending', 'confirmed', 'delivered', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateOrderStatus(selectedOrderDrawer.id, st)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      background: selectedOrderDrawer.order_status === st ? '#5C3D1E' : '#F5ECD7',
                      color: selectedOrderDrawer.order_status === st ? '#F5ECD7' : '#5C3D1E',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                    }}
                    type="button"
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: '#FDF6EC', padding: '16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', border: '1px solid #E8D5B7' }}>
              <div><strong>Customer:</strong> {selectedOrderDrawer.customer_name}</div>
              <div><strong>Email:</strong> {selectedOrderDrawer.customer_email}</div>
              <div><strong>Phone:</strong> {selectedOrderDrawer.customer_phone || selectedOrderDrawer.phone || 'N/A'}</div>
              <div>
                <strong>Delivery Address:</strong> {selectedOrderDrawer.delivery_address || selectedOrderDrawer.shipping_address || 'Address Not Provided'}
                {selectedOrderDrawer.city || selectedOrderDrawer.shipping_city ? `, ${selectedOrderDrawer.city || selectedOrderDrawer.shipping_city}` : ''}
                {selectedOrderDrawer.pincode || selectedOrderDrawer.shipping_pin ? ` - ${selectedOrderDrawer.pincode || selectedOrderDrawer.shipping_pin}` : ''}
              </div>
            </div>

            <h4 style={{ color: '#5C3D1E', marginBottom: '10px', fontSize: '15px' }}>Order Items</h4>
            {selectedOrderDrawer.items && selectedOrderDrawer.items.length > 0 ? (
              selectedOrderDrawer.items.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed #E8D5B7', fontSize: '13.5px' }}>
                  <span>{it.title || it.product_name || 'Handcrafted Kitchenware Item'} × {it.quantity}</span>
                  <strong>₹{it.total_price || (it.price * it.quantity)}</strong>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '13px', color: '#8B5E3C' }}>1x Kitchenware Item</div>
            )}

            <div style={{ marginTop: '20px', textAlign: 'right', fontSize: '16px', fontWeight: 'bold', color: '#5C3D1E' }}>
              Total: ₹{selectedOrderDrawer.total_amount?.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      )}

      {/* ENQUIRY DETAILS POPUP MODAL */}
      {selectedEnquiryDrawer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 4000,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(3px)',
          }}
          onClick={() => setSelectedEnquiryDrawer(null)}
        >
          <div
            style={{
              background: '#FFFFFF',
              maxWidth: '560px',
              width: '100%',
              borderRadius: '12px',
              padding: '28px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '2px solid #5C3D1E',
              color: '#3B2A1A',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #5C3D1E', paddingBottom: '14px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#5C3D1E', fontSize: '18px', fontFamily: 'Georgia, serif' }}>Enquiry Details</h3>
                <div style={{ fontSize: '11px', color: '#C49A6C' }}>From {selectedEnquiryDrawer.name}</div>
              </div>
              <button
                onClick={() => setSelectedEnquiryDrawer(null)}
                style={{
                  background: '#F5ECD7',
                  border: '1px solid #C49A6C',
                  color: '#5C3D1E',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}
                type="button"
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '13px', color: '#3B2A1A', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div><strong>Name:</strong> {selectedEnquiryDrawer.name}</div>
              <div><strong>Email:</strong> {selectedEnquiryDrawer.email}</div>
              <div><strong>Subject:</strong> {selectedEnquiryDrawer.subject}</div>
              <div><strong>Product Interest:</strong> {selectedEnquiryDrawer.product_interest || 'N/A'}</div>
            </div>

            <div style={{ background: '#FDF6EC', border: '1px solid #E8D5B7', padding: '16px', borderRadius: '8px', marginBottom: '20px', fontSize: '13.5px', color: '#3B2A1A' }}>
              <strong style={{ color: '#5C3D1E', display: 'block', marginBottom: '6px' }}>Message:</strong>
              {selectedEnquiryDrawer.message}
            </div>

            <a
              href={`mailto:${selectedEnquiryDrawer.email}?subject=Re: ${selectedEnquiryDrawer.subject} - Rustic Heritage`}
              className="btn-brown"
              style={{ display: 'block', textDecoration: 'none', textAlign: 'center', marginTop: '20px' }}
            >
              Reply by Email ✉️
            </a>
          </div>
        </div>
      )}

      {/* CREATE COUPON MODAL */}
      {couponModal && (
        <div className="admin-modal-backdrop open" onClick={() => setCouponModal(false)}>
          <div className="modal-box-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title-main">🎁 Create Discount Coupon</h3>
            <form onSubmit={handleCreateCoupon}>
              <div style={{ marginBottom: '14px' }}>
                <label className="label-bold" style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE20"
                  className="uppercase-input full-width"
                  style={{ padding: '10px', border: '1px solid #E8D5B7', borderRadius: '4px' }}
                  value={couponFormData.code}
                  onChange={(e) => setCouponFormData({ ...couponFormData, code: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="label-bold" style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Discount Value (% or ₹) *</label>
                <input
                  type="number"
                  required
                  className="full-width"
                  style={{ padding: '10px', border: '1px solid #E8D5B7', borderRadius: '4px' }}
                  value={couponFormData.discount_value}
                  onChange={(e) => setCouponFormData({ ...couponFormData, discount_value: e.target.value })}
                />
              </div>

              <div className="flex-end-gap12">
                <button type="button" className="btn-cancel" onClick={() => setCouponModal(false)} style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn-gold" style={{ padding: '8px 16px' }}>Create Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
