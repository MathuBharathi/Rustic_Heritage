import React from 'react';

export default function AdminProducts({ products }) {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E8D5B7', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
      {/* Table Toolbar */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #E8D5B7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FDFBFA' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#3B2A1A', fontFamily: 'Georgia, serif' }}>
          Handcrafted Products Catalogue ({products.length})
        </h3>
      </div>

      {/* Products Table */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px', fontFamily: "'Georgia', serif" }}>
          <thead>
            <tr style={{ background: '#F5ECD7' }}>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>ID</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Product</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Category</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Price</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Badge</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Material</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #F0E2CD' }}>
                <td style={{ padding: '16px 18px' }}>#{p.id}</td>
                <td style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={p.img || p.image_url || `/images/img${p.id || 1}.png`}
                      alt=""
                      style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #E8D5B7' }}
                    />
                    <strong>{p.name}</strong>
                  </div>
                </td>
                <td style={{ padding: '16px 18px', textTransform: 'capitalize' }}>{p.category}</td>
                <td style={{ padding: '16px 18px' }}><strong style={{ color: '#5C3D1E' }}>₹{p.price}</strong></td>
                <td style={{ padding: '16px 18px' }}>{p.badge ? <span className="rh-status-badge delivered">{p.badge}</span> : '-'}</td>
                <td style={{ padding: '16px 18px' }}>{p.material || 'Traditional Material'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
