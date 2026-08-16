import React from 'react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, onSelectProduct }) {
  const { addItem } = useCart();

  if (!product) return null;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addItem(product.id);
  };

  const priceVal = typeof product.price === 'number' ? product.price.toLocaleString('en-IN') : (product.price || '0');

  return (
    <div className="product-card reveal visible" onClick={() => onSelectProduct && onSelectProduct(product)}>
      {product.badge && <div className="best-seller-badge">{product.badge}</div>}
      <img src={product.img || `images/img${product.id || 1}.png`} alt={product.name || 'Product'} />
      <div className="product-card-body">
        <h3>
          {product.emoji || '🏺'} {product.name || 'Kitchenware Item'}
        </h3>
        <p className="price">
          ₹{priceVal}{' '}
          <span>/ item</span>
        </p>
        <button className="btn-brown btn-cart-sm" onClick={handleAddToCart} type="button">
          Add to Cart 🛒
        </button>
      </div>
    </div>
  );
}
