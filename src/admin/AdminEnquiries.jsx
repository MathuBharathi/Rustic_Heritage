import React from 'react';

export default function AdminEnquiries({ enquiries, onSelectEnquiry }) {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E8D5B7', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
      {/* Table Toolbar */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #E8D5B7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FDFBFA' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#3B2A1A', fontFamily: 'Georgia, serif' }}>
          Customer Contact Enquiries ({enquiries.length})
        </h3>
      </div>

      {/* Enquiries Table */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px', fontFamily: "'Georgia', serif" }}>
          <thead>
            <tr style={{ background: '#F5ECD7' }}>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Date</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Customer</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Subject</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Product Interest</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Message</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.map((eq) => (
              <tr key={eq.id} style={{ borderBottom: '1px solid #F0E2CD' }}>
                <td style={{ padding: '16px 18px' }}>{new Date(eq.created_at || Date.now()).toLocaleDateString('en-IN')}</td>
                <td style={{ padding: '16px 18px' }}>
                  <strong>{eq.name}</strong>
                  <div style={{ fontSize: '11px', color: '#8B5E3C' }}>{eq.email}</div>
                </td>
                <td style={{ padding: '16px 18px' }}>{eq.subject}</td>
                <td style={{ padding: '16px 18px' }}>{eq.product_interest || '-'}</td>
                <td style={{ padding: '16px 18px', maxWidth: '280px', lineHeight: '1.5' }}>
                  {eq.message}
                </td>
                <td style={{ padding: '16px 18px' }}>
                  <button
                    onClick={() => onSelectEnquiry(eq)}
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
                    View Details →
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
