import React from 'react';
import { Link } from 'react-router-dom';

export default function Contact() {
  return (
    <div>
      {/* HERO */}
      <section className="git-hero hero-contact-padding">
        <p className="hero-tagline">✦ We're Here to Help ✦</p>
        <h1 className="hero-contact-h1">Contact Us &amp; Customer Care</h1>
        <p>Have questions about our traditional kitchenware products, shipping or care instructions? Get in touch with our team.</p>
      </section>

      {/* CONTACT CARDS */}
      <section className="section">
        <div className="section-title reveal visible">
          <h2>Direct Channels</h2>
          <div className="divider"></div>
        </div>

        <div className="contact-grid contact-grid-700">
          <div className="contact-card">
            <div className="icon">✉️</div>
            <h4>Email Support</h4>
            <p>
              <a href="mailto:mathubharathi15@gmail.com" className="contact-link-dark">
                mathubharathi15@gmail.com
              </a>
            </p>
            <p>24/7 Response within 24 hours</p>
          </div>

          <div className="contact-card">
            <div className="icon">📞</div>
            <h4>Phone Support</h4>
            <p>
              <a href="tel:8072505342" className="contact-link-dark">
                +91 8072505342
              </a>
            </p>
            <p>Mon – Sat, 9 AM – 7 PM IST</p>
          </div>

          <div className="contact-card">
            <div className="icon">💬</div>
            <h4>WhatsApp Support</h4>
            <p>
              <a
                href="https://wa.me/918072505342"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link-wa"
              >
                Chat on WhatsApp
              </a>
            </p>
            <p>Instant answers &amp; order tracking</p>
          </div>

          <div className="contact-card">
            <div className="icon">📍</div>
            <h4>Store &amp; Location</h4>
            <p>
              <strong>Coimbatore</strong>
            </p>
            <p>Tamil Nadu, India</p>
          </div>
        </div>
      </section>

      {/* POLICIES & CUSTOMER CARE SECTION */}
      <section className="section section-pale-bg">
        <div className="section-title reveal visible">
          <h2>Shipping &amp; Policies</h2>
          <div className="divider"></div>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: '#fff', padding: '28px', borderRadius: '12px', border: '1px solid #E8D5B7' }}>
            <h3 style={{ color: '#5C3D1E', marginBottom: '12px', fontSize: '18px' }}>📦 Shipping &amp; Fast Delivery</h3>
            <p style={{ color: '#3B2A1A', lineHeight: '1.7', fontSize: '14px' }}>
              We carefully pack each fragile clay, stone, and brass vessel in multi-layer bubble wrap and reinforced corrugated boxes to ensure safe transport across India. Orders are processed within 24 hours and delivered in 3–6 business days.
            </p>
          </div>

          <div style={{ background: '#fff', padding: '28px', borderRadius: '12px', border: '1px solid #E8D5B7' }}>
            <h3 style={{ color: '#5C3D1E', marginBottom: '12px', fontSize: '18px' }}>🔄 Returns &amp; Refund Policy</h3>
            <p style={{ color: '#3B2A1A', lineHeight: '1.7', fontSize: '14px' }}>
              If your product arrives damaged or broken during transit, notify us on WhatsApp or email within 48 hours of delivery with unboxing photos/video for an immediate replacement or full refund.
            </p>
          </div>

          <div style={{ background: '#fff', padding: '28px', borderRadius: '12px', border: '1px solid #E8D5B7' }}>
            <h3 style={{ color: '#5C3D1E', marginBottom: '12px', fontSize: '18px' }}>🔒 Privacy &amp; Security</h3>
            <p style={{ color: '#3B2A1A', lineHeight: '1.7', fontSize: '14px' }}>
              We value your privacy. All customer data, delivery addresses and transaction information are securely encrypted and never shared with third parties.
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link to="/getintouch" className="btn btn-dark">
            Send an Enquiry / Message &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
