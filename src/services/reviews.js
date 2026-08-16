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

export async function toggleReviewApproval(reviewId, currentApproved) {
  const { data, error } = await supabase
    .from('reviews')
    .update({ approved: !currentApproved })
    .eq('id', reviewId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
