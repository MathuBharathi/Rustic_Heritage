import { supabase } from '../lib/supabase';

export async function fetchApprovedReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

export async function fetchAllReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

export async function submitReview({ reviewerName, city, productName, rating, reviewText, userId }) {
  const { data, error } = await supabase.from('reviews').insert({
    reviewer_name: reviewerName.trim(),
    city: city.trim() || 'India',
    product_name: productName.trim() || 'Rustic Heritage Product',
    rating: Number(rating),
    review_text: reviewText.trim(),
    approved: false,
    user_id: userId || null,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) throw error;
  return data;
}

export async function toggleReviewApproval(reviewId, currentApproved, explicitTarget) {
  const newApprovedState = explicitTarget ? explicitTarget === 'approved' : !currentApproved;
  const newStatus = newApprovedState ? 'approved' : 'hidden';

  // 1. Try updating both approved and status
  let res = await supabase
    .from('reviews')
    .update({ approved: newApprovedState, status: newStatus })
    .eq('id', reviewId)
    .select();

  if (!res.error && res.data && res.data.length > 0) return res.data[0];

  // 2. Try status column
  res = await supabase
    .from('reviews')
    .update({ status: newStatus })
    .eq('id', reviewId)
    .select();

  if (!res.error && res.data && res.data.length > 0) return res.data[0];

  // 3. Try approved column
  res = await supabase
    .from('reviews')
    .update({ approved: newApprovedState })
    .eq('id', reviewId)
    .select();

  if (!res.error && res.data && res.data.length > 0) return res.data[0];

  // 4. Try is_approved column
  res = await supabase
    .from('reviews')
    .update({ is_approved: newApprovedState })
    .eq('id', reviewId)
    .select();

  if (res.error) throw res.error;
  return res.data?.[0];
}
