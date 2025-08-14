import React, { useRef, useState } from "react";

import { featureData, feedbacks } from "../data/content";

const Homepage = ({ onExploreFeature }) => {
  const featuresRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="homepage">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo-cluster">
          <span className="emoji">🍴</span>
          <span className="logo-text">EATLYSTIC</span>
          <span className="emoji">🏃</span>
        </div>
        <ul className="nav-links">
          <li>KitchenVault</li>
          <li>MealCraft</li>
          <li>HealthSync</li>
          <li>Settings</li>
          <li>Login</li>
        </ul>
      </nav>

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
              onClick={() => onExploreFeature && onExploreFeature(f.title)}
            >
              Explore
            </button>
          </div>
        ))}
      </section>

      {/* Reviews */}
      <section className="reviews-section">
        <h2>What Our Users Say</h2>
        <div className="feedback-bubbles">
          {feedbacks.map((fb) => (
            <div
              className="feedback-bubble"
              key={fb.name}
              style={{ background: fb.color }}
            >
              <p className="feedback-text">"{fb.text}"</p>
              <p className="feedback-name">– {fb.name}</p>
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
