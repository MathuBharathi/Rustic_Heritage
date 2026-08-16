import { supabase } from '../lib/supabase';

export async function submitContactEnquiry({ name, email, subject, productInterest, message }) {
  const { data, error } = await supabase.from('contact_enquiries').insert({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject || 'General Enquiry',
    product_interest: productInterest || null,
    message: message.trim(),
    status: 'new',
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) throw error;
  return data;
}

export async function fetchEnquiries() {
  const { data, error } = await supabase.from('contact_enquiries').select('*').order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
}
