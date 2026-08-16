import { supabase } from '../lib/supabase';

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
  return data;
}

export async function signUp({ email, password, fullName, phone }) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = fullName.trim();
  const cleanPhone = phone.trim();

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
        is_admin: cleanEmail === 'mathubharathi15@gmail.com',
      },
      { onConflict: 'auth_user_id' }
    );
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getProfile(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('auth_user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId, profileData) {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({ auth_user_id: userId, ...profileData, updated_at: new Date().toISOString() }, { onConflict: 'auth_user_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}
