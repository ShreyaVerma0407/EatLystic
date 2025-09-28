import React, { useRef, useState, useEffect } from "react";
import "../styles/Homepage.css";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { motion } from "framer-motion";
import Footer from "./Footer";

// CONSTANTS for the filter/animation (matching the SASS/Pug globals)
const BORDER_SIZE = 6; // --b
const MOTION_AMOUNT = 1; // --m
const BLUR_RADIUS = Math.round(0.25 * BORDER_SIZE); // r

const Homepage = ({ onExploreFeature }) => {
  const featuresRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [featureData, setFeatureData] = useState([]);
  const [reviewsData, setReviewsData] = useState([]); 
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Define the new Cartify feature data
    const cartifyFeature = {
        title: "Cartify",
        desc: "Discover what's missing in your pantry and add the essential ingredients to your cart for a fully stocked kitchen!",
        image: "/images/cartify.png",
        route: "/shoppingcart" 
    };

    // Fetch feature data
    fetch("/data/content.json")
      .then((res) => res.json())
      .then((data) => {
        const updatedFeatureData = [...(data.featureData || []), cartifyFeature];
        setFeatureData(updatedFeatureData);
      })
      .catch((err) => {
        console.error("Failed to load content:", err);
        setFeatureData([cartifyFeature]); 
      });

    // Fetch reviews data from data/reviews.json
    fetch("/data/reviews.json") 
      .then((res) => res.json())
      .then((data) => {
        setReviewsData(data || []);
      })
      .catch((err) => {
        console.error("Failed to load reviews:", err);
        setReviewsData([]); 
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
    <div 
        className="homepage" 
        style={{ 
            '--b': `${BORDER_SIZE}px`, 
            '--m': `${MOTION_AMOUNT}` 
        }}
    >
      {/* Navbar */}
      <Navbar />

      {/* SVG Filters (Hidden) */}
      <svg width='0' height='0' aria-hidden='true'>
        <filter id='glow-0' x='-.25' y='-.25' width='1.5' height='1.5'>
          <feComponentTransfer>
            <feFuncA type='table' tableValues='0 2 0'/>
          </feComponentTransfer>
          <feGaussianBlur stdDeviation={BLUR_RADIUS}/>
          <feComponentTransfer result='rond'>
            <feFuncA type='table' tableValues={`${-BLUR_RADIUS} ${BLUR_RADIUS + 1}`}/>
          </feComponentTransfer>
          <feMorphology operator='dilate' radius={0.5 * BORDER_SIZE}/>
          <feGaussianBlur stdDeviation={BORDER_SIZE}/>
          <feBlend in='rond' result='glow'/>
          <feComponentTransfer in='SourceGraphic'>
            <feFuncA type='table' tableValues='0 0 1'/>
          </feComponentTransfer>
          <feBlend in2='glow'/>
        </filter>
        
        <filter id='glow-1' x='-.25' y='-.25' width='1.5' height='1.5'>
          <feComponentTransfer in='SourceGraphic' result='grad'>
            <feFuncA type='table' tableValues='0 2 0'/>
          </feComponentTransfer>
          <feMorphology operator='dilate' radius={0.5 * BORDER_SIZE}/>
          <feGaussianBlur stdDeviation={BORDER_SIZE} result='glow'/>
          <feTurbulence type='fractalNoise' baseFrequency='7.13'/>
          <feDisplacementMap in='glow' scale={MOTION_AMOUNT * BORDER_SIZE} yChannelSelector='R'/>
          <feComponentTransfer>
            <feFuncA type='linear' slope='.8'/>
          </feComponentTransfer>
          <feBlend in='grad' result='out'/>
          <feComponentTransfer in='SourceGraphic'>
            <feFuncA type='table' tableValues='0 0 1'/>
          </feComponentTransfer>
          <feBlend in2='out'/>
        </filter>
      </svg>
      {/* End SVG Filters */}

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
            "KitchenSync": "/pantry",
            "Calorie Counter": "/calorie",
            "Fitness Goals": "/fitness",
            "Cartify": "/shoppingcart" 
          };

          const route = FEATURE_ROUTES[feature.title] || feature.route || "/"; 

          return (
            <div
              key={feature.title}
              className="feature-card animated-glow-border" 
              onClick={() => navigate(route)}
              style={{ 
                  cursor: "pointer",
                  '--l': (index % 2 === 0) 
                          ? '#f9573880, #fff7f780, #f9573880' 
                          : '#ff62017f, #fff 25%, #ff90007f 50%, #fff 75%, #ff62017f', 
                  '--f': (index % 3 === 0) ? 'url(#glow-1)' : 'url(#glow-0)',
                  padding: '0',
                  boxShadow: '0 6px 15px rgba(0,0,0,0.1)', 
                  borderRadius: '15px' 
              }}
            >
              <div 
                className="feature-media"
                style={{
                    width: '100%',
                    // ✅ Increased height to 300px
                    height: '300px', 
                    overflow: 'hidden',
                    marginBottom: '0', 
                    borderRadius: '15px 15px 0 0' 
                }}
              >
                <img 
                    src={feature.thumbnail || feature.image} 
                    alt={feature.title} 
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block' 
                    }}
                />
              </div>
              
              {/* Tightened Text Content */}
              <div style={{ padding: '0.8rem 1.5rem 1.2rem 1.5rem', textAlign: 'center' }}>
                <h3 
                  style={{ 
                    color: '#fc8019', 
                    fontSize: '1.2rem', // ✅ Lowered heading size
                    margin: '0 0 0.4rem 0', // ✅ Reduced margin after heading
                    fontWeight: 'bold', 
                    textDecoration: 'underline' 
                  }}
                >
                    {feature.title}
                </h3>
                <p 
                  style={{ 
                    fontSize: '0.85rem', // ✅ Lowered content size further
                    color: '#333', // ✅ Set color to black
                    fontWeight: 'bold', // ✅ Set font to bold
                    margin: '0 0 0.8rem 0' // ✅ Reduced margin after description
                  }}
                >
                    {feature.desc}
                </p>
                <button
                    className="feature-explore-btn"
                    style={{ padding: '0.4rem 1rem' }} // ✅ Reduced button padding
                    onClick={(e) => {
                        e.stopPropagation();
                        onExploreFeature && onExploreFeature(feature.title);
                        navigate(route);
                    }}
                >
                    Explore
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* Reviews Section with Framer Motion */}
      <section className="reviews-section">
        <h1 style={{ fontWeight: "bolder" }}>What Our Users Say ?</h1>

        {/* Row 1 - scrolls left */}
        <motion.div
          className="feedback-bubbles-row row-right"
          animate={{ x: ["0%", "-100%"] }}
          transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
        >
          {[...row1Reviews, ...row1Reviews].map((fb, index) => {
            if (!fb || !fb.stars) return null; 
            return (
              <div 
                className="feedback-bubble"
                key={`fb-top-${index}`}
              >
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
                <p className="feedback-name">- {fb.name}</p> 
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
            if (!fb || !fb.stars) return null; 
            return (
              <div 
                className="feedback-bubble"
                key={`fb-bottom-${index}`}
              >
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
                <p className="feedback-name">- {fb.name}</p> 
              </div>
            );
          })}
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="video-section">
        <h2 style={{ color: "black" }}>How the Website Works</h2>

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
      <Footer />
    </div>
  );
};

export default Homepage;