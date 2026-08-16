import React from 'react';
import { useCart } from '../context/CartContext';

export default function ProductDetailModal({ product, onClose }) {
  const { addItem } = useCart();

  if (!product) return null;

  const handleAddToCart = () => {
    addItem(product.id);
  };

  return (
    <div
      className="prod-modal-overlay"
      style={{ display: 'flex' }}
      onClick={onClose}
    >
      <div
        className="prod-modal-card"
        style={{ opacity: 1, transform: 'translateY(0)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pm-header">
          <div>
            <div className="pm-title">
              {product.emoji} {product.name}
            </div>
            <div className="pm-subtitle">✦ AUTHENTIC KITCHENWARE SPECIFICATIONS ✦</div>
          </div>
          <button className="pm-close-btn" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        <div className="pm-divider"></div>

        <div className="pm-img-wrap">
          <img className="pm-img" src={product.img} alt={product.name} />
        </div>

        <div className="pm-body">
          <div className="pm-price-row">
            <div className="pm-price">₹{product.price.toLocaleString('en-IN')}</div>
            {product.badge && (
              <span className="pm-badge" style={{ display: 'inline-block' }}>
                ⭐ {product.badge}
              </span>
            )}
          </div>

          {product.desc && <div className="pm-desc">"{product.desc}"</div>}

          <div className="pm-specs-grid">
            <div className="pm-spec-box">
              <div className="pm-spec-label">Material</div>
              <div className="pm-spec-value">{product.material || 'Traditional Material'}</div>
            </div>
            <div className="pm-spec-box">
              <div className="pm-spec-label">Weight</div>
              <div className="pm-spec-value">{product.weight || 'Standard Weight'}</div>
            </div>
            <div className="pm-spec-box">
              <div className="pm-spec-label">Dimensions</div>
              <div className="pm-spec-value">{product.dimensions || 'Standard Dimensions'}</div>
            </div>
            <div className="pm-spec-box">
              <div className="pm-spec-label">Origin</div>
              <div className="pm-spec-value">{product.origin || 'India'}</div>
            </div>
          </div>

          {product.care && (
            <div className="pm-care-box">
              <div className="pm-care-label">🧼 Care &amp; Maintenance</div>
              <div className="pm-care-text">{product.care}</div>
            </div>
          )}

          <button className="pm-cart-btn" onClick={handleAddToCart} type="button">
            Add to Cart 🛒 (₹{product.price})
          </button>
        </div>
      </div>
    </div>
  );
}
