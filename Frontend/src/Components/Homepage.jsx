import React, { useRef, useState, useEffect } from "react";
import "../styles/Homepage.css";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { motion } from "framer-motion";

const Homepage = ({ onExploreFeature }) => {
  const featuresRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [featureData, setFeatureData] = useState([]);
  const [reviewsData, setReviewsData] = useState([]); // New state to hold reviews
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Fetch feature data
    fetch("/data/content.json")
      .then((res) => res.json())
      .then((data) => {
        setFeatureData(data.featureData || []);
      })
      .catch((err) => console.error("Failed to load content:", err));

    // Fetch reviews data from data/reviews.json
    fetch("/data/reviews.json") // Corrected path for reviews.json
      .then((res) => res.json())
      .then((data) => {
        setReviewsData(data || []);
      })
      .catch((err) => {
        console.error("Failed to load reviews:", err);
        setReviewsData([]); // Set to empty array on error
      });
  }, []);

  // Repeat reviews to fill 20 divs total for smooth looping
  const repeatedReviews = Array(20)
    .fill(0)
    .map((_, i) => reviewsData[i % reviewsData.length]);

  // Split reviews into 2 rows for smooth looping
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
            Track, cook, and fuel your body with Eatlystic – where healthy
            eating meets convenience.
          </p>
          <button className="explore-btn" onClick={scrollToFeatures}>
            EXPLORE NOW
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="features" ref={featuresRef}>
        {featureData.map((feature, index) => {
          const FEATURE_ROUTES = {
            "Nutrient Tracker": "/nutrient",
            "Recipe Generator": "/recipe",
            KitchenSync: "/pantry",
            "Calorie Counter": "/calorie",
            "Fitness Goals": "/fitness",
          };

          const route = FEATURE_ROUTES[feature.title] || "/";

          return (
            <div
              key={feature.title}
              className={`feature-card ${hoveredIndex === index ? "hovered" : ""}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => navigate(route)}
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
                  e.stopPropagation();
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

      {/* Reviews Section with Framer Motion */}
      <section className="reviews-section">
        <h2>What Our Users Say</h2>

       {/* Row 1 - scrolls left */}
<motion.div
  className="feedback-bubbles-row row-right"
  animate={{ x: ["0%", "-100%"] }}
  transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
>
  {[...row1Reviews, ...row1Reviews].map((fb, index) => {
    if (!fb || !fb.stars) return null; // Skip rendering if fb is undefined or doesn't have stars
    return (
      <div className="feedback-bubble" key={`fb-top-${index}`}>
        <div className="stars">
          {/* Render exact number of stars from reviewsData */}
          {Array(fb.stars).fill(0).map((_, i) => (
            <span key={i} className="star">★</span>
          ))}
        </div>
        <p className="feedback-text">"{fb.text}"</p>
         <p className="feedback-name">- {fb.name}</p>  {/* Display the name */}
      </div>
    );
  })}
</motion.div>

{/* Row 2 - scrolls right */}
<motion.div
  className="feedback-bubbles-row row-left"
  animate={{ x: ["-100%", "0%"] }}
  transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
>
  {[...row2Reviews, ...row2Reviews].map((fb, index) => {
    if (!fb || !fb.stars) return null; // Skip rendering if fb is undefined or doesn't have stars
    return (
      <div className="feedback-bubble" key={`fb-bottom-${index}`}>
        <div className="stars">
          {/* Render exact number of stars from reviewsData */}
          {Array(fb.stars).fill(0).map((_, i) => (
            <span key={i} className="star">★</span>
          ))}
        </div>
        <p className="feedback-text">"{fb.text}"</p>
       <p className="feedback-name">- {fb.name}</p> {/* Display the name with a dash before it */}

      </div>
    );
  })}
</motion.div>

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
