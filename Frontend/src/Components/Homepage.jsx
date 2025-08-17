// src/Components/Homepage.jsx

import React, { useRef, useState } from "react";
import "../styles/Homepage.css";
import { featureData } from "../data/content";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const reviewsData = [
  {
    text:
      "Once I got familiar with the free version and used it a ton I upgraded to gold and love it even more - thoughtful features and easy UI, my most used app - favorite features are importing a recipe and scanning foods",
    stars: 5,
    source: "App Store Review",
  },
  {
    text:
      "I don’t pay for the gold membership, I only use the free version, but it is very comprehensive. In my opinion it gives loads more feedback than any other free app. It is simple, and quick to input data with instant results. The creators have defo got it right. 10/10",
    stars: 5,
    source: "App Store Review",
  },
  {
    text:
      "This is a comprehensive app for calories. It boasts a vast food database for effortless entry. You can add your intake, and even connect with import. The free version is feature rich; subscription unlocks personalization.",
    stars: 5,
    source: "App Store Review",
  },
  {
    text:
      '"The BEST meal/health/fitness tracking app ever. #1. They care. #2. Gold membership is worth it. #3. It links to Apple health. It’s just all there. I love it. #4. I would 100% work for this organization if I could. Love you guys and appreciate all you do."',
    stars: 5,
    source: "App Store Review",
  },
  {
    text:
      "PHENOMENAL. Incredibly comprehensive nutrient tracking, calorie counting, goal targeting. Even data on what food does for your body is at your disposal here. And it has introduced me to foods I never would have tried before. 10 out of 5 stars.",
    stars: 5,
    source: "App Store Review",
  },
];

// Repeat reviews to fill 20 divs total for smooth looping
const repeatedReviews = Array(20)
  .fill(0)
  .map((_, i) => reviewsData[i % reviewsData.length]);

const Homepage = ({ onExploreFeature }) => {
  const featuresRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const row1Reviews = repeatedReviews.slice(0, 10);
  const row2Reviews = repeatedReviews.slice(10, 20);

  return (
    <div className="homepage">
      <Navbar />

      {/* Hero */}
      <section className="hero">
        <div className="hero-overlay">
          <h1 className="hero-title">EATLYSTIC</h1>
          <p className="hero-description">
            Track, cook, and fuel your body with Eatlystic – where healthy eating meets convenience.
          </p>
          <button className="explore-btn" onClick={scrollToFeatures}>
            EXPLORE NOW
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="features" ref={featuresRef}>
        {featureData.map((f, index) => (
          <div
            key={f.title}
            className={`feature-card ${hoveredIndex === index ? "hovered" : ""}`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => navigate("/pantry")}
            style={{ cursor: "pointer" }}
          >
            <div className="feature-media">
              {hoveredIndex === index ? (
                <iframe
                  src={`https://www.youtube.com/embed/${f.videoId}?autoplay=1&mute=1&loop=1&playlist=${f.videoId}`}
                  title={f.title}
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                ></iframe>
              ) : (
                <img src={f.thumbnail} alt={f.title} />
              )}
            </div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
            <button
              className="feature-explore-btn"
              onClick={(e) => {
                e.stopPropagation();
                onExploreFeature && onExploreFeature(f.title);
                navigate("/pantry");
              }}
            >
              Explore
            </button>
          </div>
        ))}
      </section>

      {/* Reviews Section */}
      <section className="reviews-section">
        <h2>What Our Users Say</h2>

        <div className="feedback-bubbles-row row-right">
          {row1Reviews.map((fb, index) => (
            <div className="feedback-bubble" key={`fb-top-${index}`}>
              <div className="stars">
                {Array(fb.stars)
                  .fill(0)
                  .map((_, i) => (
                    <span key={i} className="star">★</span>
                  ))}
              </div>
              <p className="feedback-text">"{fb.text}"</p>
              <p className="feedback-name">{fb.source}</p>
            </div>
          ))}
        </div>

        <div className="feedback-bubbles-row row-left">
          {row2Reviews.map((fb, index) => (
            <div className="feedback-bubble" key={`fb-bottom-${index}`}>
              <div className="stars">
                {Array(fb.stars)
                  .fill(0)
                  .map((_, i) => (
                    <span key={i} className="star">★</span>
                  ))}
              </div>
              <p className="feedback-text">"{fb.text}"</p>
              <p className="feedback-name">{fb.source}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="video-section">
        <h2>How the Website Works</h2>
        <div className="video-container">
          <iframe
            src="https://www.youtube.com/embed/1O8qAzyH7m4"
            title="How our website works"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 Eatlystic. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Homepage;
