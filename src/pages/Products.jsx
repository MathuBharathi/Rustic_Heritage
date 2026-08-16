import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import { PRODUCTS, fetchProducts } from '../services/products';

export default function Products() {
  const [productList, setProductList] = useState(PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    let mounted = true;
    fetchProducts()
      .then((data) => {
        if (mounted && Array.isArray(data) && data.length > 0) {
          setProductList(data);
        }
      })
      .catch((err) => {
        console.warn('Could not load products from API, using fallback:', err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const categories = [
    { id: 'all', label: 'All Products' },
    { id: 'stone', label: '🪨 Stone' },
    { id: 'clay', label: '🏺 Clay' },
    { id: 'wood', label: '🥄 Wood' },
    { id: 'brass', label: '⚱️ Brass & Copper' },
    { id: 'ceramic', label: '🫙 Ceramic & Natural' },
  ];

  const filteredProducts = productList.filter((p) => {
    if (!p) return false;
    const name = (p.name || '').toLowerCase();
    const desc = (p.desc || '').toLowerCase();
    const material = (p.material || '').toLowerCase();
    const query = (searchQuery || '').toLowerCase();

    const matchesSearch =
      !query ||
      name.includes(query) ||
      desc.includes(query) ||
      material.includes(query);

    const cat = p.category || 'all';
    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'brass' && ['brass', 'cast-iron'].includes(cat)) ||
      (selectedCategory === 'ceramic' && ['ceramic', 'natural'].includes(cat)) ||
      cat === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* PRODUCTS HERO */}
      <section className="products-hero">
        <p className="hero-tagline">✦ Traditional Indian Kitchenware ✦</p>
        <h1>Our Products Collection</h1>
        <p>Explore handcrafted vessels, cookware and utensils made by master artisans across India.</p>
      </section>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <input
          type="text"
          className="filter-search"
          placeholder="🔍 Search products, materials, origin..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
            type="button"
          >
            {cat.label}
          </button>
        ))}

        <div className="filter-count">
          Showing {filteredProducts.length} of {productList.length} products
        </div>
      </div>

      {/* PRODUCTS GRID SECTION */}
      <section className="section">
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8B5E3C' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
            <h3 style={{ fontSize: '20px', color: '#3B2A1A', marginBottom: '8px' }}>No products found</h3>
            <p style={{ fontSize: '15px' }}>Try searching with a different keyword or resetting your category filter.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="btn btn-dark"
              style={{ marginTop: '16px' }}
              type="button"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={setSelectedProduct}
              />
            ))}
          </div>
        )}
      </section>

      {/* PRODUCT DETAIL MODAL */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
