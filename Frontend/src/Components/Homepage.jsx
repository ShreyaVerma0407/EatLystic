// src/Components/Homepage.jsx

import React, { useRef, useState, useEffect } from "react";
import "../styles/Homepage.css";
import { useNavigate } from "react-router-dom"; // ✅ Added for navigation
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
  const [featureData, setFeatureData] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const navigate = useNavigate(); // ✅ Hook for navigating

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetch("/data/content.json")
      .then((res) => res.json())
      .then((data) => {
        setFeatureData(data.featureData);
        setFeedbacks(data.feedbacks);
      })
      .catch((err) => console.error("Failed to load content:", err));
  }, []);

  // Split repeatedReviews into two rows
  const row1Reviews = repeatedReviews.slice(0, 10);
  const row2Reviews = repeatedReviews.slice(10, 20);

  return (
    <div className="homepage">
      {/* Navbar */}
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
        {featureData.map((feature, index) => {
          // Map feature titles to routes
          const FEATURE_ROUTES = {
            "Nutrient Tracker": "/nutrient",
            "Recipe Generator": "/recipe-generator",
            KitchenSync: "/pantry", // Make sure matches featureData exactly
            "Calorie Counter": "/calorie",
            "Fitness Goals": "/fitness-goals",
          };

          const route = FEATURE_ROUTES[feature.title] || "/";

          return (
            <div
              key={feature.title}
              className={`feature-card ${hoveredIndex === index ? "hovered" : ""}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => navigate(route)} // Navigate on card click
              style={{ cursor: "pointer" }}
            >
              <div className="feature-media">
                {hoveredIndex === index ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${feature.videoId}?autoplay=1&mute=1&loop=1&playlist=${feature.videoId}`}
                    title={feature.title}
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                ) : (
                  <img src={feature.thumbnail} alt={feature.title} />
                )}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
              <button
                className="feature-explore-btn"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering card click
                  onExploreFeature && onExploreFeature(feature.title);
                  navigate(route);
                }}
              >
                Explore
              </button>
            </div>
          );
        })}
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
                    <span key={i} className="star">
                      ★
                    </span>
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
                    <span key={i} className="star">
                      ★
                    </span>
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
