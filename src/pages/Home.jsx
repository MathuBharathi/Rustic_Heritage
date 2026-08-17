import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import { PRODUCTS } from '../services/products';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Newsletter subscription
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [subscribeMsg, setSubscribeMsg] = useState(null); // { text, color }

  const featuredProducts = PRODUCTS.filter((p) => [7, 8, 15, 6].includes(p.id));

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const cleanEmail = subscribeEmail.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setSubscribeMsg({ text: 'Please enter a valid email address.', color: '#e57373' });
      return;
    }

    setSubscribeLoading(true);
    setSubscribeMsg(null);

    try {
      let apiData = null;
      try {
        const res = await fetch('/api/newsletter-subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail }),
        });
        if (res.ok) apiData = await res.json();
      } catch (apiErr) {
        console.warn('/api/newsletter-subscribe endpoint unreachable, using direct Supabase fallback:', apiErr);
      }

      if (apiData) {
        if (apiData.success) {
          setSubscribeMsg({
            text: '🎉 You are successfully subscribed!',
            color: '#81c784',
          });
          setSubscribeEmail('');
          return;
        } else if (apiData.duplicate) {
          setSubscribeMsg({
            text: '✦ You are already subscribed!',
            color: '#C49A6C',
          });
          setSubscribeEmail('');
          return;
        }
      }

      // Supabase direct fallback
      const { data: existing } = await supabase
        .from('subscribers')
        .select('coupon_code')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existing) {
        setSubscribeMsg({
          text: '✦ You are already subscribed!',
          color: '#C49A6C',
        });
        setSubscribeEmail('');
        return;
      }

      const randomPercent = Math.floor(Math.random() * 11) + 10;
      const couponCode = 'WELCOME-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data: couponData } = await supabase
        .from('coupons')
        .insert({
          code: couponCode,
          discount_type: 'percentage',
          discount_value: randomPercent,
          minimum_order: 299,
          maximum_discount: 200,
          usage_limit: 1,
          active: true,
          free_delivery: false,
          expiry_date: expiryDate,
          generated_by_system: true,
          subscriber_email: cleanEmail,
        })
        .select()
        .maybeSingle();

      await supabase.from('subscribers').insert({
        email: cleanEmail,
        coupon_id: couponData?.id || null,
        coupon_code: couponCode,
        email_sent: false,
        active: true,
      });

      setSubscribeMsg({
        text: '🎉 You are successfully subscribed!',
        color: '#81c784',
      });
      setSubscribeEmail('');
    } catch (err) {
      console.error('Subscription error:', err);
      setSubscribeMsg({
        text: `⚠ ${err.message || 'Subscription failed. Please try again.'}`,
        color: '#e57373',
      });
    } finally {
      setSubscribeLoading(false);
    }
  };

  return (
    <div>
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <p className="hero-tagline">✦ Rooted in Tradition ✦</p>
          <h1>
            Rustic Heritage
            <br />
            Kitchenware
          </h1>
          <p>
            Bringing the warmth of traditional Indian kitchenware to your modern home. Crafted with love, built to last
            generations.
          </p>
          <div className="hero-btns">
            <Link to="/products" className="btn">
              Explore Products
            </Link>
            <Link to="/reviews" className="btn btn-outline">
              Customer Stories
            </Link>
          </div>
        </div>
      </section>

      {/* BRAND PHILOSOPHY STATEMENT */}
      <section className="brand-philosophy-section">
        <div className="brand-philosophy-container reveal visible">
          <span className="philosophy-eyebrow">✦ THE RUSTIC HERITAGE PHILOSOPHY ✦</span>
          <h2 className="philosophy-heading">
            Rooted in tradition.
            <br />
            Crafted for the way you cook today.
          </h2>
          <p className="philosophy-text">
            "Discover authentic Indian kitchenware shaped by timeless craftsmanship, natural materials and generations of culinary tradition."
          </p>
          <Link to="/products" className="philosophy-cta">
            Explore the Collection &rarr;
          </Link>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="about-section">
        <div className="about-inner reveal visible">
          <div className="about-pot">🏺</div>
          <div className="about-text">
            <h2>Our Story</h2>
            <p>
              At Rustic Heritage Kitchenware, we believe the soul of Indian cooking lies in the vessels and tools used to
              prepare food. From stone grinders to brass uruli, each piece carries centuries of culinary wisdom.
            </p>
            <p>
              We source directly from traditional artisans across India, ensuring authenticity, quality, and fair
              livelihoods for our craftspeople.
            </p>
            <Link to="/products" className="btn btn-dark">
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section">
        <div className="section-title reveal visible">
          <h2>Featured Products</h2>
          <p>Handpicked favourites from our traditional collection</p>
          <div className="divider"></div>
        </div>

        <div className="products-grid">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={setSelectedProduct}
            />
          ))}
        </div>

        <div className="text-center-mt40 reveal visible">
          <Link to="/products" className="btn btn-dark">
            View All Products
          </Link>
        </div>
      </section>

      {/* STATS STRIP */}
      <div className="stats-strip">
        <div className="stat-item reveal visible">
          <h3>500+</h3>
          <p>Products Sold</p>
        </div>
        <div className="stat-item reveal visible">
          <h3>200+</h3>
          <p>Happy Customers</p>
        </div>
        <div className="stat-item reveal visible">
          <h3>15+</h3>
          <p>Artisan Products</p>
        </div>
        <div className="stat-item reveal visible">
          <h3>4.8★</h3>
          <p>Average Rating</p>
        </div>
      </div>

      {/* SUBSCRIBE SECTION */}
      <section className="subscribe-section">
        <div className="subscribe-container">
          <p className="subscribe-eyebrow">✦ Stay Connected ✦</p>
          <h2 className="subscribe-title">Subscribe for Exclusive Offers</h2>
          <p className="subscribe-desc">
            Enter your email to receive a special{' '}
            <strong className="subscribe-highlight">15-20% discount coupon</strong> and stay updated on new arrivals!
          </p>
          <form className="subscribe-form-wrapper" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="you@example.com"
              className="subscribe-input"
              value={subscribeEmail}
              onChange={(e) => setSubscribeEmail(e.target.value)}
              disabled={subscribeLoading}
              required
            />
            <button type="submit" className="subscribe-btn" disabled={subscribeLoading}>
              {subscribeLoading ? 'Subscribing…' : 'Subscribe →'}
            </button>
          </form>

          {subscribeMsg && (
            <div className="subscribe-msg" style={{ color: subscribeMsg.color }}>
              {subscribeMsg.text}
            </div>
          )}
        </div>
      </section>

      {/* PRODUCT DETAIL MODAL */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
