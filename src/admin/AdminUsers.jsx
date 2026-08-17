import React, { useState } from 'react';

export default function AdminUsers({ users = [] }) {
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    return (
      (u.full_name && u.full_name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.phone && u.phone.includes(term))
    );
  });

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E8D5B7', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
      {/* Table Toolbar */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #E8D5B7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FDFBFA', gap: '16px', flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#3B2A1A', fontFamily: 'Georgia, serif' }}>
          Registered Store Customers ({filteredUsers.length})
        </h3>
        <input
          type="text"
          placeholder="🔍 Search users by name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
      </div>

      {/* Users Table */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px', fontFamily: "'Georgia', serif" }}>
          <thead>
            <tr style={{ background: '#F5ECD7' }}>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Customer Profile</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Email & Phone</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Account Role</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Joined Date</th>
              <th style={{ padding: '14px 18px', borderBottom: '1.5px solid #E8D5B7', color: '#5C3D1E', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Default Address</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#8B5E3C' }}>
                  No registered users found matching your search.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id || u.email} style={{ borderBottom: '1px solid #F0E2CD' }}>
                  <td style={{ padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: '#C49A6C',
                          color: '#3B2A1A',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '14px',
                        }}
                      >
                        {(u.full_name || u.email || 'U').slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <strong>{u.full_name || 'Store Customer'}</strong>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 18px' }}>
                    <div><strong>{u.email}</strong></div>
                    <div style={{ fontSize: '11px', color: '#8B5E3C' }}>{u.phone || 'No phone saved'}</div>
                  </td>
                  <td style={{ padding: '16px 18px' }}>
                    {u.is_admin ? (
                      <span style={{ background: '#5C3D1E', color: '#F5ECD7', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>
                        ADMIN
                      </span>
                    ) : (
                      <span style={{ background: '#E8D5B7', color: '#5C3D1E', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>
                        CUSTOMER
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '16px 18px' }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : 'Recent'}
                  </td>
                  <td style={{ padding: '16px 18px', color: '#8B5E3C', fontSize: '12px' }}>
                    {u.default_address ? (
                      <div>{u.default_address}, {u.default_city} {u.default_pin}</div>
                    ) : (
                      <span>Not provided yet</span>
                    )}
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
