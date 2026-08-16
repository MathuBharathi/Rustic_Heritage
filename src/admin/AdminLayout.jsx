import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminLayout({
  user,
  activeTab,
  setActiveTab,
  signOut,
  dataLoading,
  actionMsg,
  ordersCount,
  reviewsCount,
  enquiriesCount,
  subscribersCount,
  couponsCount,
  children,
}) {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#FDF6EC',
        fontFamily: "'Georgia', serif",
        color: '#3B2A1A',
        width: '100%',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
      }}
    >
      {/* VERTICAL SIDEBAR */}
      <aside
        style={{
          width: '260px',
          minWidth: '260px',
          maxWidth: '260px',
          background: '#2C1A0E',
          color: '#F5ECD7',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 16px',
          boxSizing: 'border-box',
          minHeight: '100vh',
          borderRight: '1px solid #4A321F',
          flexShrink: 0,
        }}
      >
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', padding: '0 8px' }}>
          <div
            style={{
              fontSize: '26px',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: '#FDF6EC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #C49A6C',
              flexShrink: 0,
            }}
          >
            🏺
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#F5ECD7', letterSpacing: '0.5px', lineHeight: 1.2 }}>
              Rustic Heritage
            </div>
            <div style={{ fontSize: '9px', color: '#C49A6C', letterSpacing: '2.5px', textTransform: 'uppercase', marginTop: '2px' }}>
              ADMIN PANEL
            </div>
          </div>
        </div>

        {/* Vertical Navigation Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#C49A6C', marginBottom: '8px', padding: '0 10px', opacity: 0.85 }}>
            MAIN NAVIGATION
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 14px',
              borderRadius: '6px',
              fontSize: '13.5px',
              fontFamily: "'Georgia', serif",
              cursor: 'pointer',
              border: 'none',
              textAlign: 'left',
              background: activeTab === 'dashboard' ? '#5C3D1E' : 'transparent',
              color: activeTab === 'dashboard' ? '#F5ECD7' : '#E8D5B7',
              fontWeight: activeTab === 'dashboard' ? 'bold' : 'normal',
              boxShadow: activeTab === 'dashboard' ? '0 2px 8px rgba(0,0,0,0.25)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            📊 Overview Dashboard
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 14px',
              borderRadius: '6px',
              fontSize: '13.5px',
              fontFamily: "'Georgia', serif",
              cursor: 'pointer',
              border: 'none',
              textAlign: 'left',
              background: activeTab === 'orders' ? '#5C3D1E' : 'transparent',
              color: activeTab === 'orders' ? '#F5ECD7' : '#E8D5B7',
              fontWeight: activeTab === 'orders' ? 'bold' : 'normal',
              boxShadow: activeTab === 'orders' ? '0 2px 8px rgba(0,0,0,0.25)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            📦 Orders ({ordersCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 14px',
              borderRadius: '6px',
              fontSize: '13.5px',
              fontFamily: "'Georgia', serif",
              cursor: 'pointer',
              border: 'none',
              textAlign: 'left',
              background: activeTab === 'products' ? '#5C3D1E' : 'transparent',
              color: activeTab === 'products' ? '#F5ECD7' : '#E8D5B7',
              fontWeight: activeTab === 'products' ? 'bold' : 'normal',
              boxShadow: activeTab === 'products' ? '0 2px 8px rgba(0,0,0,0.25)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            🏺 Products Catalogue
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 14px',
              borderRadius: '6px',
              fontSize: '13.5px',
              fontFamily: "'Georgia', serif",
              cursor: 'pointer',
              border: 'none',
              textAlign: 'left',
              background: activeTab === 'reviews' ? '#5C3D1E' : 'transparent',
              color: activeTab === 'reviews' ? '#F5ECD7' : '#E8D5B7',
              fontWeight: activeTab === 'reviews' ? 'bold' : 'normal',
              boxShadow: activeTab === 'reviews' ? '0 2px 8px rgba(0,0,0,0.25)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            ⭐ Customer Reviews ({reviewsCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('enquiries')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 14px',
              borderRadius: '6px',
              fontSize: '13.5px',
              fontFamily: "'Georgia', serif",
              cursor: 'pointer',
              border: 'none',
              textAlign: 'left',
              background: activeTab === 'enquiries' ? '#5C3D1E' : 'transparent',
              color: activeTab === 'enquiries' ? '#F5ECD7' : '#E8D5B7',
              fontWeight: activeTab === 'enquiries' ? 'bold' : 'normal',
              boxShadow: activeTab === 'enquiries' ? '0 2px 8px rgba(0,0,0,0.25)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            💬 Get In Touch ({enquiriesCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('subscribers')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 14px',
              borderRadius: '6px',
              fontSize: '13.5px',
              fontFamily: "'Georgia', serif",
              cursor: 'pointer',
              border: 'none',
              textAlign: 'left',
              background: activeTab === 'subscribers' ? '#5C3D1E' : 'transparent',
              color: activeTab === 'subscribers' ? '#F5ECD7' : '#E8D5B7',
              fontWeight: activeTab === 'subscribers' ? 'bold' : 'normal',
              boxShadow: activeTab === 'subscribers' ? '0 2px 8px rgba(0,0,0,0.25)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            ✉️ Newsletter ({subscribersCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('coupons')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 14px',
              borderRadius: '6px',
              fontSize: '13.5px',
              fontFamily: "'Georgia', serif",
              cursor: 'pointer',
              border: 'none',
              textAlign: 'left',
              background: activeTab === 'coupons' ? '#5C3D1E' : 'transparent',
              color: activeTab === 'coupons' ? '#F5ECD7' : '#E8D5B7',
              fontWeight: activeTab === 'coupons' ? 'bold' : 'normal',
              boxShadow: activeTab === 'coupons' ? '0 2px 8px rgba(0,0,0,0.25)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            🎁 Discount Coupons ({couponsCount})
          </button>
        </div>

        {/* Sidebar Footer */}
        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(196, 154, 108, 0.2)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: 'rgba(196, 154, 108, 0.2)',
              border: '1px solid rgba(196, 154, 108, 0.4)',
              color: '#F5ECD7',
              borderRadius: '6px',
              fontSize: '13px',
              textDecoration: 'none',
              fontFamily: "'Georgia', serif",
            }}
          >
            🏪 View Storefront ↗
          </Link>
          <button
            onClick={signOut}
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: '#8b1a1a',
              border: 'none',
              color: '#FFF',
              borderRadius: '6px',
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: "'Georgia', serif",
            }}
          >
            Sign Out Admin 🚪
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        {/* Top Header */}
        <header
          style={{
            height: '70px',
            background: '#FFFFFF',
            borderBottom: '1px solid #E8D5B7',
            padding: '0 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3B2A1A', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>Admin Control Panel</span>
            {dataLoading && <span className="rh-spinner" style={{ borderColor: '#5C3D1E' }}></span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ background: '#5C3D1E', color: '#F5ECD7', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>
              OWNER ADMIN
            </span>
            <span style={{ fontSize: '13px', color: '#5C3D1E', fontWeight: 'bold' }}>{user?.email}</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#C49A6C', color: '#3B2A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
              A
            </div>
          </div>
        </header>

        {actionMsg && (
          <div style={{ background: '#3B2A1A', color: '#F5ECD7', padding: '12px 32px', fontSize: '14px', fontWeight: 'bold' }}>
            {actionMsg}
          </div>
        )}

        <div style={{ padding: '32px', flex: 1, boxSizing: 'border-box', overflowX: 'auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
