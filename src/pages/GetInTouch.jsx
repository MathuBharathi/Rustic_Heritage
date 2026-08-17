import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { PRODUCTS } from '../services/products';

export default function GetInTouch() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [product, setProduct] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg('Please fill in all required fields marked with *');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.from('contact_enquiries').insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject || 'General Enquiry',
        product_interest: product || null,
        message: message.trim(),
        status: 'new',
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      setSuccessMsg(true);
      setName('');
      setEmail('');
      setSubject('');
      setProduct('');
      setMessage('');
    } catch (err) {
      console.error('Enquiry error:', err);
      setErrorMsg(err.message || 'Error submitting message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="git-hero">
        <p className="hero-tagline">✦ We'd Love to Hear From You ✦</p>
        <h1>Get In Touch</h1>
        <p>Have a question, feedback, or just want to say hello? Drop us a message!</p>
      </section>

      <section className="section">
        <div className="section-title reveal visible">
          <h2>Send Us a Message</h2>
          <p>We usually respond within 24 hours</p>
          <div className="divider"></div>
        </div>

        <div className="form-container reveal visible">
          <form onSubmit={handleSubmit}>
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
                <label>Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="priya@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                title="Select Subject"
              >
                <option value="">Select a subject</option>
                <option value="Product Enquiry">Product Enquiry</option>
                <option value="Order Issue">Order Issue</option>
                <option value="Write a Review">Write a Review</option>
                <option value="Bulk / Wholesale Order">Bulk / Wholesale Order</option>
                <option value="General Feedback">General Feedback</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Product of Interest</label>
              <select
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                title="Select Product of Interest"
              >
                <option value="">Select a product (optional)</option>
                {PRODUCTS.map((p) => (
                  <option key={p.id} value={`${p.name} – ₹${p.price}`}>
                    {p.name} – ₹{p.price}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Your Message *</label>
              <textarea
                required
                placeholder="Write your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
            </div>

            <button type="submit" className="btn-brown" disabled={loading}>
              {loading ? 'Sending Message…' : 'Send Message 📩'}
            </button>

            {errorMsg && (
              <div style={{ marginTop: '16px', color: '#e57373', textAlign: 'center', fontSize: '14px' }}>
                ❌ {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="success-msg" style={{ display: 'block', marginTop: '16px' }}>
                ✅ Thank you! Your message has been sent. We'll get back to you within 24 hours.
              </div>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}
