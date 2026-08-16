import React from 'react';

export default function AdminReviews({ reviews, onToggleApprove }) {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E8D5B7', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
      {/* Table Toolbar */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #E8D5B7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FDFBFA' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#3B2A1A', fontFamily: 'Georgia, serif' }}>
          Customer Reviews ({reviews.length})
        </h3>
      </div>

      {/* Reviews Table */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px', fontFamily: "'Georgia', serif" }}>
          <thead>
            <tr style={{ background: '#F5ECD7' }}>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Reviewer</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Rating</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Product</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Review Content</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Status</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #F0E2CD' }}>
                <td style={{ padding: '16px 18px' }}>
                  <strong>{r.reviewer_name}</strong>
                  <div style={{ fontSize: '11px', color: '#8B5E3C' }}>{r.city}</div>
                </td>
                <td style={{ padding: '16px 18px' }}><span style={{ color: '#D4AF37', fontSize: '15px' }}>{'★'.repeat(r.rating || 5)}</span></td>
                <td style={{ padding: '16px 18px' }}>{r.product_name}</td>
                <td style={{ padding: '16px 18px', maxWidth: '320px', lineHeight: '1.5' }}>"{r.review_text}"</td>
                <td style={{ padding: '16px 18px' }}>
                  <span className={`rh-status-badge ${r.approved ? 'delivered' : 'pending'}`}>
                    {r.approved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td style={{ padding: '16px 18px' }}>
                  <button
                    onClick={() => onToggleApprove(r.id, r.approved)}
                    type="button"
                    style={{
                      background: r.approved ? '#FFF3CD' : '#D4EDDA',
                      color: r.approved ? '#856404' : '#155724',
                      border: `1px solid ${r.approved ? '#ffeeba' : '#c3e6cb'}`,
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontFamily: "'Georgia', serif",
                    }}
                  >
                    {r.approved ? 'Hide' : 'Approve'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
