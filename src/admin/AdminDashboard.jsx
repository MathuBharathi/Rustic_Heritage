import React from 'react';

export default function AdminDashboard({ orders, products, subscribers, reviews, users = [], onNavigateOrders }) {
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.order_status === 'pending').length;
  const totalSubscribers = subscribers.length;

  return (
    <div>
      {/* KPI METRIC CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '8px', border: '1px solid #E8D5B7', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', letterSpacing: '2px', color: '#8B5E3C', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>
            TOTAL REVENUE
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3B2A1A', marginBottom: '4px' }}>
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '12px', color: '#8B5E3C' }}>Lifetime Store Orders</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '8px', border: '1px solid #E8D5B7', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', letterSpacing: '2px', color: '#8B5E3C', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>
            TOTAL ORDERS
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3B2A1A', marginBottom: '4px' }}>
            {totalOrders}
          </div>
          <div style={{ fontSize: '12px', color: '#8B5E3C' }}>{pendingOrders} Pending Fulfillment</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '8px', border: '1px solid #E8D5B7', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', letterSpacing: '2px', color: '#8B5E3C', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>
            REGISTERED USERS
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3B2A1A', marginBottom: '4px' }}>
            {users.length}
          </div>
          <div style={{ fontSize: '12px', color: '#8B5E3C' }}>Registered Store Accounts</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '8px', border: '1px solid #E8D5B7', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', letterSpacing: '2px', color: '#8B5E3C', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>
            SUBSCRIBERS
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3B2A1A', marginBottom: '4px' }}>
            {totalSubscribers}
          </div>
          <div style={{ fontSize: '12px', color: '#8B5E3C' }}>Welcome Coupon Claimed</div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '8px', border: '1px solid #E8D5B7', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', letterSpacing: '2px', color: '#8B5E3C', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>
            CATALOGUE ITEMS
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3B2A1A', marginBottom: '4px' }}>
            {products.length}
          </div>
          <div style={{ fontSize: '12px', color: '#8B5E3C' }}>Handcrafted Indian Products</div>
        </div>
      </div>

      {/* RECENT CUSTOMER ORDERS TABLE CARD */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E8D5B7', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E8D5B7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FDFBFA' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#3B2A1A', fontFamily: 'Georgia, serif' }}>
            Recent Customer Orders
          </h3>
          <button
            onClick={onNavigateOrders}
            type="button"
            style={{
              background: '#F5ECD7',
              color: '#5C3D1E',
              border: '1px solid #C49A6C',
              padding: '8px 14px',
              borderRadius: '4px',
              fontSize: '12.5px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: "'Georgia', serif",
            }}
          >
            View All Orders ({orders.length}) →
          </button>
        </div>

        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px', fontFamily: "'Georgia', serif" }}>
            <thead>
              <tr style={{ background: '#F5ECD7' }}>
                <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Order ID</th>
                <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Customer</th>
                <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Items</th>
                <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Total</th>
                <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Payment Method</th>
                <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id} style={{ borderBottom: '1px solid #F0E2CD' }}>
                  <td style={{ padding: '16px 18px' }}>
                    <strong style={{ fontSize: '12.5px', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                      #{String(o.order_number || o.id).slice(0, 18)}
                    </strong>
                  </td>
                  <td style={{ padding: '16px 18px' }}>
                    <div><strong>{o.customer_name}</strong></div>
                    <div style={{ fontSize: '11px', color: '#8B5E3C' }}>{o.customer_email}</div>
                  </td>
                  <td style={{ padding: '16px 18px' }}>{o.items?.length || 1} item(s)</td>
                  <td style={{ padding: '16px 18px' }}><strong style={{ color: '#5C3D1E' }}>₹{o.total_amount?.toLocaleString('en-IN')}</strong></td>
                  <td style={{ padding: '16px 18px' }}><span style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold' }}>{o.payment_method}</span></td>
                  <td style={{ padding: '16px 18px' }}>
                    <span className={`rh-status-badge ${o.order_status || 'pending'}`}>
                      {o.order_status || 'pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
