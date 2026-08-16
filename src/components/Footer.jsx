import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="logo">
            <div className="logo-icon">🏺</div>
            <div className="logo-text">
              <span>Rustic Heritage</span>
              <span>Kitchenware</span>
            </div>
          </div>
          <p>Preserving the art of traditional Indian cooking through authentic, handcrafted kitchenware.</p>
        </div>

        <div className="footer-col">
          <h5>Quick Links</h5>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/getintouch">Get In Touch</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h5>Customer Care</h5>
          <ul>
            <li><Link to="/contact">Shipping &amp; Delivery</Link></li>
            <li><Link to="/contact">Returns &amp; Refund Policy</Link></li>
            <li><Link to="/profile">Track Order</Link></li>
            <li><Link to="/contact">Privacy Policy</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h5>Contact</h5>
          <ul>
            <li><a href="mailto:mathubharathi15@gmail.com">✉️ mathubharathi15@gmail.com</a></li>
            <li><a href="tel:8072505342">📞 +91 8072505342</a></li>
            <li><a href="https://wa.me/918072505342" target="_blank" rel="noopener noreferrer">💬 WhatsApp Support</a></li>
            <li><a href="#location">📍 Coimbatore, Tamil Nadu, India</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Rustic Heritage Kitchenware. All rights reserved. | Made with ❤️ in India</p>
      </div>
    </footer>
  );
}
