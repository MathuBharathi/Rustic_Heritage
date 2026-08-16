import React from 'react';

export default function AdminSubscribers({ subscribers, onResendEmail }) {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E8D5B7', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
      {/* Table Toolbar */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #E8D5B7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FDFBFA' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#3B2A1A', fontFamily: 'Georgia, serif' }}>
          Newsletter Subscribers ({subscribers.length})
        </h3>
      </div>

      {/* Subscribers Table */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px', fontFamily: "'Georgia', serif" }}>
          <thead>
            <tr style={{ background: '#F5ECD7' }}>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Subscriber Email</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Coupon Code</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Welcome Email Status</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Subscribed Date</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((sub) => (
              <tr key={sub.id} style={{ borderBottom: '1px solid #F0E2CD' }}>
                <td style={{ padding: '16px 18px' }}><strong>{sub.email}</strong></td>
                <td style={{ padding: '16px 18px' }}>
                  <code style={{ background: '#F5ECD7', padding: '4px 10px', borderRadius: '4px', color: '#3B2A1A', fontWeight: 'bold', fontFamily: 'monospace' }}>
                    {sub.coupon_code || 'WELCOME15'}
                  </code>
                </td>
                <td style={{ padding: '16px 18px' }}>
                  <span className={`rh-status-badge ${sub.email_sent ? 'delivered' : 'pending'}`}>
                    {sub.email_sent ? 'Sent' : 'Pending'}
                  </span>
                </td>
                <td style={{ padding: '16px 18px' }}>{new Date(sub.created_at || Date.now()).toLocaleDateString('en-IN')}</td>
                <td style={{ padding: '16px 18px' }}>
                  <button
                    onClick={() => onResendEmail(sub)}
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
                    Resend Email ✉️
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
