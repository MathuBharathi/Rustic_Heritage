import React, { useState } from 'react';

export default function AdminOrders({ orders, onSelectOrder }) {
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      (o.id && String(o.id).includes(orderSearch)) ||
      (o.order_number && String(o.order_number).toLowerCase().includes(orderSearch.toLowerCase())) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (o.customer_email && o.customer_email.toLowerCase().includes(orderSearch.toLowerCase()));

    const matchesStatus = orderStatusFilter === 'all' || o.order_status === orderStatusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E8D5B7', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
      {/* Table Toolbar */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #E8D5B7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FDFBFA', gap: '16px', flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#3B2A1A', fontFamily: 'Georgia, serif' }}>
          Customer Orders ({filteredOrders.length})
        </h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="🔍 Search orders by ID, name or email..."
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: '6px',
              border: '1.5px solid #E8D5B7',
              fontSize: '13px',
              outline: 'none',
              width: '280px',
              fontFamily: "'Georgia', serif",
              background: '#fff',
            }}
          />
          <select
            value={orderStatusFilter}
            onChange={(e) => setOrderStatusFilter(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: '6px',
              border: '1.5px solid #E8D5B7',
              fontSize: '13px',
              background: '#fff',
              fontFamily: "'Georgia', serif",
              outline: 'none',
            }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
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
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Order Status</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: '#8B5E3C' }}>
                  No orders match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
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
                    <span className={`rh-status-badge ${o.order_status || 'pending'}`}>
                      {o.order_status || 'pending'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 18px' }}>
                    <button
                      onClick={() => onSelectOrder(o)}
                      type="button"
                      style={{
                        background: '#F5ECD7',
                        color: '#5C3D1E',
                        border: '1px solid #C49A6C',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontFamily: "'Georgia', serif",
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
