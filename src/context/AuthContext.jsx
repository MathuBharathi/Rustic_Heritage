import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();
const ADMIN_EMAILS = ['workatbuildcrew@gmail.com', 'mathubharathi15@gmail.com'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');

  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const fetchUserProfile = async (authUser) => {
    if (!authUser) {
      setProfile(null);
      return;
    }
    try {
      const email = (authUser.email || '').toLowerCase();
      let { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .maybeSingle();

      const isOwnerEmail = ADMIN_EMAILS.includes(email);

      if (isOwnerEmail && (!data || data.is_admin !== true)) {
        const { data: updatedPf } = await supabase
          .from('user_profiles')
          .upsert({
            auth_user_id: authUser.id,
            email: email,
            full_name: authUser.user_metadata?.full_name || 'Admin User',
            is_admin: true,
          }, { onConflict: 'auth_user_id' })
          .select()
          .maybeSingle();
        data = updatedPf || data;
      }

      setProfile(data || {
        auth_user_id: authUser.id,
        email: email,
        full_name: authUser.user_metadata?.full_name || email.split('@')[0],
        is_admin: isOwnerEmail,
      });
    } catch (err) {
      console.warn('Profile fetch error:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(session);
          setUser(session?.user || null);
          if (session?.user) {
            await fetchUserProfile(session.user);
          }
        }
      } catch (err) {
        console.warn('Auth init notice:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    localStorage.removeItem('rh_user_profile');
    localStorage.removeItem('rh_checkout_address');
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const value = {
    user,
    session,
    profile,
    loading,
    isAdmin: profile?.is_admin === true || ADMIN_EMAILS.includes((user?.email || '').toLowerCase()),
    authModalOpen,
    authModalTab,
    openAuthModal,
    closeAuthModal,
    signOut,
    refreshProfile: () => user && fetchUserProfile(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
