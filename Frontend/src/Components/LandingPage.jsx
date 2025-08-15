import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/register"); // Redirects to Signup.jsx route
  };

  return (
    <div className="landing-container">
      {/* Background video */}
      <video className="background-video" autoPlay muted loop>
        <source src="/images/cooking.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark gradient overlay */}
      <div className="gradient-overlay"></div>

      {/* Overlay content */}
      <div className="overlay">
        {/* Neon brand name */}
        <h1 className="fade-in brand-name">EATLYSTIC</h1>

        {/* Glowing Get Started button */}
        <button
          className="get-started-btn fade-in"
          onClick={handleGetStarted}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

export default LandingPage;
