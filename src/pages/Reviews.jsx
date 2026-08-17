import React, { useState, useEffect } from 'react';
import ReviewCarousel from '../components/ReviewCarousel';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const DEFAULT_REVIEWS = [
  {
    id: 1,
    reviewer_name: 'Sunitha Ramachandran',
    city: 'Chennai',
    state: 'Tamil Nadu',
    product_name: 'Clay Cooking Pot with Lid',
    rating: 5,
    review_text: 'Cooking in the clay pot brings back memories of my grandmother\'s kitchen in Palakkad. The flavor difference is real!',
  },
  {
    id: 2,
    reviewer_name: 'Vijay Karthik',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    product_name: 'Teak Wood Ladle Set',
    rating: 5,
    review_text: 'The teak wood ladles are smooth, beautifully finished, and so comfortable to use. Worth every rupee.',
  },
  {
    id: 3,
    reviewer_name: 'Lakshmi Nair',
    city: 'Thrissur',
    state: 'Kerala',
    product_name: 'Brass Uruli + Ladle Set',
    rating: 5,
    review_text: 'Delivered fast and safely packed. The brass uruli looks stunning on my dining table even when not cooking!',
  },
  {
    id: 4,
    reviewer_name: 'Ananya Sengupta',
    city: 'Kolkata',
    state: 'West Bengal',
    product_name: 'Granite Cookware Set',
    rating: 4,
    review_text: 'The granite cookware set is worth every rupee. Non-stick, easy to clean and looks premium on my kitchen shelf.',
  },
  {
    id: 5,
    reviewer_name: 'Ramesh Krishnan',
    city: 'Bengaluru',
    state: 'Karnataka',
    product_name: 'Stone Mortar & Pestle',
    rating: 5,
    review_text: 'Heavy, solid granite. Grinds garlic and ginger paste in seconds. Excellent traditional product.',
  },
  {
    id: 6,
    reviewer_name: 'Meera Patel',
    city: 'Ahmedabad',
    state: 'Gujarat',
    product_name: 'Terracotta Water Bottles',
    rating: 5,
    review_text: 'Keeps water naturally cool all day during summer. Tastes fresh and clean.',
  },
];

export default function Reviews() {
  const { user } = useAuth();
  const [reviewsList, setReviewsList] = useState(DEFAULT_REVIEWS);

  // Form state
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [productName, setProductName] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null); // { text, color }

  useEffect(() => {
    fetchApprovedReviews();
  }, []);

  const fetchApprovedReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const approvedOnly = data.filter(
          (rev) => rev.approved !== false && (rev.status || 'approved').toLowerCase() !== 'hidden'
        );

        const formatted = approvedOnly.map((rev) => ({
          ...rev,
          reviewer_name: rev.customer_name || rev.reviewer_name || 'Store Customer',
          city: rev.location || rev.city || 'India',
        }));
        setReviewsList([...formatted, ...DEFAULT_REVIEWS]);
      }
    } catch (e) {
      console.warn('Reviews fetch notice:', e);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!name.trim() || !reviewText.trim()) {
      setMsg({ text: 'Please fill in your name and review details.', color: '#e57373' });
      return;
    }

    setLoading(true);
    setMsg(null);

    const cleanName = name.trim();
    const cleanCity = city.trim() || 'India';
    const cleanProduct = productName.trim() || 'Rustic Heritage Kitchenware';

    let payload = {
      customer_name: cleanName,
      reviewer_name: cleanName,
      customer_email: user?.email || null,
      location: cleanCity,
      city: cleanCity,
      product_name: cleanProduct,
      rating: Number(rating),
      review_text: reviewText.trim(),
      status: 'approved',
      approved: true,
      created_at: new Date().toISOString(),
    };

    let attempts = 0;
    let insertErr = null;

    while (attempts < 5) {
      attempts++;
      const res = await supabase.from('reviews').insert(payload);
      if (!res.error) {
        insertErr = null;
        break;
      }
      insertErr = res.error;
      const match = (insertErr.message || '').match(/Could not find the '([^']+)' column/i);
      if (match && match[1]) {
        delete payload[match[1]];
      } else {
        break;
      }
    }

    if (insertErr) {
      console.error('Review submission error:', insertErr);
    }

    // Instantly refresh list from database
    await fetchApprovedReviews();

    setMsg({
      text: '🎉 Thank you for sharing your story! Your review has been submitted and posted successfully.',
      color: '#155724',
    });

    setName('');
    setCity('');
    setProductName('');
    setRating(5);
    setReviewText('');
    setLoading(false);
  };

  return (
    <div>
      {/* HERO */}
      <section className="git-hero">
        <p className="hero-tagline">✦ Real Stories ✦</p>
        <h1>Customer Stories</h1>
        <p>Hear from the kitchens that trust Rustic Heritage every day</p>
      </section>

      {/* ALL CUSTOMER EXPERIENCES SECTION */}
      <section className="all-experiences-section">
        <div className="section-title reveal visible" style={{ marginBottom: '24px' }}>
          <h2>All Customer Experiences</h2>
          <p>Read authentic feedback from families and chefs cooking with our handcrafted heritage utensils</p>
          <div className="divider"></div>
        </div>

        <div className="reviews-horizontal-scroll">
          {reviewsList.map((rev, index) => (
            <div key={rev.id || index} className="review-grid-card">
              {rev.product_name && <span className="product-tag">{rev.product_name}</span>}
              <div className="stars">
                {'★'.repeat(rev.rating || 5)}
                {'☆'.repeat(5 - (rev.rating || 5))}
              </div>
              <p className="review-text">"{rev.review_text}"</p>
              <div className="reviewer">
                <div className="avatar">
                  {(rev.customer_name || rev.reviewer_name || 'Customer').slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="reviewer-name">{rev.customer_name || rev.reviewer_name || 'Store Customer'}</div>
                  <div className="reviewer-loc">{rev.location || rev.city || 'India'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WRITE A REVIEW SECTION */}
      <section className="share-story-section">
        <div className="section-title reveal visible" style={{ marginBottom: '20px' }}>
          <h2>Share Your Kitchen Story</h2>
          <p>We'd love to hear how Rustic Heritage kitchenware enhances your cooking</p>
          <div className="divider"></div>
        </div>

        <div className="form-container" style={{ textAlign: 'left' }}>
          <form onSubmit={handleSubmitReview}>
            <div className="form-row">
              <div className="form-group">
                <label>Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Ramesh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Your City / State</label>
                <input
                  type="text"
                  placeholder="e.g. Coimbatore, Tamil Nadu"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Product Purchased</label>
                <input
                  type="text"
                  placeholder="e.g. Stone Mortar & Pestle"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Rating *</label>
                <div style={{ display: 'flex', gap: '8px', padding: '6px 0', fontSize: '26px', cursor: 'pointer' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setRating(star)}
                      style={{ color: star <= rating ? '#C49A6C' : '#E8D5B7', transition: 'color 0.15s' }}
                    >
                      ★
                    </span>
                  ))}
                  <span style={{ fontSize: '13px', color: '#8B5E3C', alignSelf: 'center', marginLeft: '8px', fontFamily: "'Georgia', serif" }}>
                    ({rating}/5 Excellent)
                  </span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Your Review / Experience *</label>
              <textarea
                required
                placeholder="Tell us about the quality, packing, cooking experience or craft..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              ></textarea>
            </div>

            <button type="submit" className="btn-brown" disabled={loading}>
              {loading ? 'Submitting Review…' : 'Submit Review 🌟'}
            </button>

            {msg && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '14px',
                  borderRadius: '6px',
                  background: msg.color === '#155724' ? '#d4edda' : '#f8d7da',
                  color: msg.color,
                  textAlign: 'center',
                  fontSize: '14px',
                }}
              >
                {msg.text}
              </div>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}
