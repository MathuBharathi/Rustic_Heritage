import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', fontFamily: 'Georgia, serif', background: '#FDF6EC' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="rh-spinner" style={{ width: '32px', height: '32px', borderWidth: '3px', borderColor: '#C49A6C', borderTopColor: '#3B2A1A', marginBottom: '16px' }}></div>
          <div style={{ fontSize: '15px', color: '#5C3D1E', fontWeight: 'bold' }}>Verifying Administrator Authorization…</div>
        </div>
      </div>
    );
  }

  const isVerifiedAdmin =
    !!user &&
    (profile?.is_admin === true || (user.email || '').toLowerCase() === 'mathubharathi15@gmail.com');

  if (!isVerifiedAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
