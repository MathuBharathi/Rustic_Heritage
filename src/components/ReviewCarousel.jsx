import React, { useState, useEffect } from 'react';

const REVIEWS = [
  {
    id: 1,
    rating: 5,
    text: '"Cooking in the clay pot brings back memories of my grandmother\'s kitchen in Palakkad. The flavor difference is real!"',
    name: 'Sunitha Ramachandran',
    location: 'Verified Buyer · Chennai',
    initial: 'S',
  },
  {
    id: 2,
    rating: 5,
    text: '"The teak wood ladles are smooth, beautifully finished, and so comfortable to use. Worth every rupee."',
    name: 'Vijay Karthik',
    location: 'Verified Buyer · Coimbatore',
    initial: 'V',
  },
  {
    id: 3,
    rating: 5,
    text: '"Delivered fast and safely packed. The brass uruli looks stunning on my dining table even when not cooking!"',
    name: 'Lakshmi Nair',
    location: 'Thrissur, Kerala · Brass Uruli + Ladle Set',
    initial: 'L',
  },
  {
    id: 4,
    rating: 4,
    text: '"The granite cookware set is worth every rupee. Non-stick, easy to clean and looks premium. The granite finish is beautiful on my kitchen shelf."',
    name: 'Ananya Sengupta',
    location: 'Kolkata · Granite Cookware Set',
    initial: 'A',
  },
];

export default function ReviewCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % REVIEWS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % REVIEWS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length);
  };

  const current = REVIEWS[currentIndex];

  return (
    <div className="reviews-carousel">
      <div className="review-slide active">
        <div className="review-card">
          <div className="stars">
            {'★'.repeat(current.rating)}
            {'☆'.repeat(5 - current.rating)}
          </div>
          <p className="review-text">{current.text}</p>
          <div className="reviewer">
            <div className="reviewer-avatar">{current.initial}</div>
            <div className="reviewer-info">
              <h4>{current.name}</h4>
              <p>{current.location}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="carousel-controls">
        <button className="carousel-btn" onClick={handlePrev} type="button" aria-label="Previous Review">
          ‹
        </button>
        <div className="carousel-dots">
          {REVIEWS.map((_, idx) => (
            <span
              key={idx}
              className={`dot ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
            ></span>
          ))}
        </div>
        <button className="carousel-btn" onClick={handleNext} type="button" aria-label="Next Review">
          ›
        </button>
      </div>
    </div>
  );
}
