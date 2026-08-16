import React from 'react';

export default function AdminCoupons({ coupons, onCreateClick }) {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E8D5B7', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
      {/* Table Toolbar */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #E8D5B7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FDFBFA' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#3B2A1A', fontFamily: 'Georgia, serif' }}>
          Discount Coupons ({coupons.length})
        </h3>
        <button
          onClick={onCreateClick}
          type="button"
          style={{
            background: 'linear-gradient(135deg, #3B2A1A, #5C3D1E)',
            color: '#F5ECD7',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontFamily: "'Georgia', serif",
          }}
        >
          + Create New Coupon
        </button>
      </div>

      {/* Coupons Table */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px', fontFamily: "'Georgia', serif" }}>
          <thead>
            <tr style={{ background: '#F5ECD7' }}>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Coupon Code</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Discount</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Min Order</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Used Count</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #F0E2CD' }}>
                <td style={{ padding: '16px 18px' }}>
                  <strong style={{ letterSpacing: '1px', fontFamily: 'monospace', fontSize: '13px' }}>{c.code}</strong>
                </td>
                <td style={{ padding: '16px 18px' }}>
                  <strong style={{ color: '#5C3D1E' }}>
                    {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`}
                  </strong>
                </td>
                <td style={{ padding: '16px 18px' }}>₹{c.minimum_order || 0}</td>
                <td style={{ padding: '16px 18px' }}>{c.used_count || 0} time(s)</td>
                <td style={{ padding: '16px 18px' }}>
                  <span className={`rh-status-badge ${c.active ? 'delivered' : 'cancelled'}`}>
                    {c.active ? 'Active' : 'Disabled'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
