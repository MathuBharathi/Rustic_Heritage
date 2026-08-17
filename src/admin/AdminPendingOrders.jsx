import React, { useState } from 'react';

export default function AdminPendingOrders({ orders, onSelectOrder }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter only pending orders
  const pendingOrders = orders.filter((o) => {
    const isPending = (o.order_status || 'pending').toLowerCase() === 'pending';
    const matchesSearch =
      !searchQuery.trim() ||
      (o.id && String(o.id).toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.order_number && String(o.order_number).toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.customer_email && o.customer_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.customer_phone && o.customer_phone.includes(searchQuery));

    return isPending && matchesSearch;
  });

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E8D5B7', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
      {/* Table Toolbar */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #E8D5B7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FDFBFA', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16.5px', color: '#3B2A1A', fontFamily: 'Georgia, serif' }}>
            ⏳ Pending Orders ({pendingOrders.length})
          </h3>
          <span style={{ fontSize: '12px', color: '#8B5E3C' }}>Directly access and process newly placed customer orders</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="🔍 Search pending orders by ID, name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: '6px',
              border: '1.5px solid #E8D5B7',
              fontSize: '13px',
              outline: 'none',
              width: '300px',
              fontFamily: "'Georgia', serif",
              background: '#fff',
            }}
          />
        </div>
      </div>

      {/* Pending Orders Table */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px', fontFamily: "'Georgia', serif" }}>
          <thead>
            <tr style={{ background: '#F5ECD7' }}>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Order Ref</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Date</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Customer Details</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Items</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Amount</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Payment</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Status</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingOrders.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '36px 24px', textAlign: 'center', color: '#8B5E3C' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
                  <strong style={{ fontSize: '15px', color: '#3B2A1A' }}>No pending orders requiring fulfillment</strong>
                  <div style={{ fontSize: '13px', marginTop: '4px' }}>All customer orders have been processed and confirmed.</div>
                </td>
              </tr>
            ) : (
              pendingOrders.map((o) => (
                <tr key={o.id} style={{ borderBottom: '1px solid #F0E2CD' }}>
                  <td style={{ padding: '16px 18px' }}>
                    <strong style={{ fontSize: '12.5px', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                      #{String(o.order_number || o.id).slice(0, 16)}
                    </strong>
                  </td>
                  <td style={{ padding: '16px 18px' }}>{new Date(o.created_at || Date.now()).toLocaleDateString('en-IN')}</td>
                  <td style={{ padding: '16px 18px' }}>
                    <div><strong>{o.customer_name}</strong></div>
                    <div style={{ fontSize: '11px', color: '#8B5E3C' }}>{o.customer_email} · {o.customer_phone}</div>
                  </td>
                  <td style={{ padding: '16px 18px' }}>{o.items?.length || 1} item(s)</td>
                  <td style={{ padding: '16px 18px' }}><strong style={{ color: '#5C3D1E' }}>₹{o.total_amount?.toLocaleString('en-IN')}</strong></td>
                  <td style={{ padding: '16px 18px' }}><span style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold' }}>{o.payment_method}</span></td>
                  <td style={{ padding: '16px 18px' }}>
                    <span className="rh-status-badge pending">
                      pending
                    </span>
                  </td>
                  <td style={{ padding: '16px 18px' }}>
                    <button
                      onClick={() => onSelectOrder(o)}
                      type="button"
                      style={{
                        background: '#5C3D1E',
                        color: '#F5ECD7',
                        border: 'none',
                        padding: '7px 14px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontFamily: "'Georgia', serif",
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                    >
                      Manage Order →
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
