import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function AuthModal() {
  const { authModalOpen, authModalTab, openAuthModal, closeAuthModal, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Signup fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Status
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  if (!authModalOpen) return null;

  const resetFormFields = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    setConfirmPassword('');
  };

  const handleTabChange = (tab) => {
    setAlert(null);
    resetFormFields();
    openAuthModal(tab);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAlert(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setAlert({ type: 'error', message: 'Email and password are required.' });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) throw error;

      await refreshProfile();
      setAlert({ type: 'success', message: 'Welcome back! Signed in successfully.' });
      setTimeout(() => {
        closeAuthModal();
      }, 600);
    } catch (err) {
      console.error('Login error:', err);
      setAlert({ type: 'error', message: err.message || 'Invalid login credentials.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAlert(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setAlert({ type: 'error', message: 'Admin email and password are required.' });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) throw error;

      // Verify admin privileges
      const { data: pf } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('auth_user_id', data.user.id)
        .maybeSingle();

      const isAdminUser = pf?.is_admin === true || cleanEmail === 'mathubharathi15@gmail.com';

      if (!isAdminUser) {
        await supabase.auth.signOut();
        setAlert({ type: 'error', message: 'You are not authorized to access the admin dashboard.' });
        setLoading(false);
        return;
      }

      await refreshProfile();
      setAlert({ type: 'success', message: 'Admin authorization verified. Accessing Dashboard…' });
      setTimeout(() => {
        closeAuthModal();
        navigate('/admin');
      }, 600);
    } catch (err) {
      console.error('Admin Login error:', err);
      setAlert({ type: 'error', message: err.message || 'Authentication failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setAlert(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();

    if (!cleanName || !cleanEmail || !password || !confirmPassword) {
      setAlert({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    if (password !== confirmPassword) {
      setAlert({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    if (password.length < 6) {
      setAlert({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    if (!agreeTerms) {
      setAlert({ type: 'error', message: 'You must agree to the Terms of Service & Privacy Policy.' });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            phone: cleanPhone,
          },
        },
      });

      if (error) throw error;

      if (data?.user) {
        await supabase.from('user_profiles').upsert(
          {
            auth_user_id: data.user.id,
            email: cleanEmail,
            full_name: cleanName,
            phone: cleanPhone,
            is_admin: false,
          },
          { onConflict: 'auth_user_id' }
        );

        // Send registration welcome email
        fetch('/api/send-welcome-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: cleanName,
            email: cleanEmail,
          }),
        }).catch((e) => console.warn('Registration welcome email notice:', e));
      }

      await refreshProfile();
      resetFormFields();
      setAlert({
        type: 'success',
        message: '🎉 Account created successfully! You are now signed in.',
      });
      setTimeout(() => {
        closeAuthModal();
      }, 1000);
    } catch (err) {
      console.error('Signup error:', err);
      setAlert({ type: 'error', message: err.message || 'Could not create account. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setAlert({ type: 'error', message: 'Enter your email address above to reset password.' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
      if (error) throw error;
      setAlert({ type: 'info', message: `Password reset instructions sent to ${cleanEmail}` });
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Error sending password reset email.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="rh-auth-overlay" className="open" onClick={closeAuthModal}>
      <div id="rh-auth-card" onClick={(e) => e.stopPropagation()}>
        <div className="rh-auth-header">
          <div className="rh-auth-logo">
            <div className="rh-auth-logo-icon">🏺</div>
            <div className="rh-auth-logo-text">
              <span>Rustic Heritage</span>
              <span>Kitchenware</span>
            </div>
          </div>
          <div className="rh-auth-tagline">✦ Handcrafted with Care ✦</div>
          <button className="rh-auth-close" onClick={closeAuthModal} type="button" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="rh-auth-goldbar"></div>

        <div className="rh-auth-tabs">
          {authModalTab === 'admin' ? (
            <button className="rh-auth-tab active" type="button" style={{ width: '100%' }}>
              Admin Login
            </button>
          ) : (
            <>
              <button
                className={`rh-auth-tab ${authModalTab === 'login' ? 'active' : ''}`}
                onClick={() => handleTabChange('login')}
                type="button"
              >
                Sign In
              </button>
              <button
                className={`rh-auth-tab ${authModalTab === 'signup' ? 'active' : ''}`}
                onClick={() => handleTabChange('signup')}
                type="button"
              >
                Create Account
              </button>
            </>
          )}
        </div>

        <div className="rh-auth-body">
          {alert && (
            <div className={`rh-auth-alert ${alert.type}`}>
              {alert.message}
            </div>
          )}

          {authModalTab === 'admin' ? (
            <form onSubmit={handleAdminLogin}>
              <div className="rh-auth-ornament">✦ Admin Login ✦</div>

              <div className="rh-auth-field">
                <label className="rh-auth-label">Admin Email Address *</label>
                <div className="rh-auth-input-wrap">
                  <span className="rh-auth-icon">✉️</span>
                  <input
                    type="email"
                    className="rh-auth-input"
                    placeholder="Enter Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="rh-auth-field">
                <label className="rh-auth-label">Admin Password *</label>
                <div className="rh-auth-input-wrap">
                  <span className="rh-auth-icon">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="rh-auth-input"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="rh-auth-eye"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button type="submit" className="rh-auth-submit" disabled={loading}>
                {loading ? <span className="rh-spinner"></span> : 'Sign In as Administrator →'}
              </button>

              <div className="rh-auth-switch">
                <button type="button" onClick={() => handleTabChange('login')}>
                  ← Return to Customer Sign In
                </button>
              </div>
            </form>
          ) : authModalTab === 'login' ? (
            <form onSubmit={handleLogin}>
              <div className="rh-auth-ornament">✦ Welcome Back ✦</div>

              <div className="rh-auth-field">
                <label className="rh-auth-label">Email Address</label>
                <div className="rh-auth-input-wrap">
                  <span className="rh-auth-icon">✉️</span>
                  <input
                    type="email"
                    className="rh-auth-input"
                    placeholder="Enter Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="rh-auth-field">
                <label className="rh-auth-label">Password</label>
                <div className="rh-auth-input-wrap">
                  <span className="rh-auth-icon">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="rh-auth-input"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="rh-auth-eye"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="rh-auth-forgot">
                <button type="button" onClick={handleForgotPassword}>
                  Forgot password?
                </button>
              </div>

              <button type="submit" className="rh-auth-submit" disabled={loading}>
                {loading ? <span className="rh-spinner"></span> : 'Sign In to Account →'}
              </button>

              <div className="rh-auth-switch">
                Don't have an account?{' '}
                <button type="button" onClick={() => handleTabChange('signup')}>
                  Create One
                </button>
              </div>

              <div className="rh-auth-switch" style={{ marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => handleTabChange('admin')}
                  style={{ color: '#8B5E3C', fontStyle: 'italic', textDecoration: 'underline' }}
                >
                  🔐 Admin Login
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              <div className="rh-auth-ornament">✦ Join Rustic Heritage ✦</div>

              <div className="rh-auth-field">
                <label className="rh-auth-label">Full Name *</label>
                <div className="rh-auth-input-wrap">
                  <span className="rh-auth-icon">👤</span>
                  <input
                    type="text"
                    className="rh-auth-input"
                    placeholder="Enter Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="rh-auth-row2">
                <div className="rh-auth-field">
                  <label className="rh-auth-label">Email Address *</label>
                  <div className="rh-auth-input-wrap">
                    <span className="rh-auth-icon">✉️</span>
                    <input
                      type="email"
                      className="rh-auth-input"
                      placeholder="Enter Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="rh-auth-field">
                  <label className="rh-auth-label">Phone Number</label>
                  <div className="rh-auth-input-wrap">
                    <span className="rh-auth-icon">📞</span>
                    <input
                      type="tel"
                      className="rh-auth-input"
                      placeholder="Enter Mobile Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="rh-auth-field">
                <label className="rh-auth-label">Create Password *</label>
                <div className="rh-auth-input-wrap">
                  <span className="rh-auth-icon">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="rh-auth-input"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="rh-auth-eye"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="rh-auth-field">
                <label className="rh-auth-label">Confirm Password *</label>
                <div className="rh-auth-input-wrap">
                  <span className="rh-auth-icon">🔒</span>
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    className="rh-auth-input"
                    placeholder="Enter Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="rh-auth-eye"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                  >
                    {showConfirmPw ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="rh-auth-check">
                <input
                  type="checkbox"
                  id="rh-terms-check"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <label htmlFor="rh-terms-check">
                  I agree to the Terms of Service &amp; Privacy Policy. Receive exclusive discount codes by email.
                </label>
              </div>

              <button type="submit" className="rh-auth-submit" disabled={loading}>
                {loading ? <span className="rh-spinner"></span> : 'Create My Account →'}
              </button>

              <div className="rh-auth-switch">
                Already have an account?{' '}
                <button type="button" onClick={() => handleTabChange('login')}>
                  Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
