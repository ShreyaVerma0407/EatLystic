// src/components/NotFound.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/NotFound.css";

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/home");
  };

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <p className="not-found-subtitle">Page Not Found</p>
        <p className="not-found-text">
          Oops! It seems you've taken a wrong turn. The page you're looking for
          doesn't exist or has been moved.
        </p>
        <button className="go-home-button" onClick={handleGoHome}>
          Go Back Home
        </button>
      </div>
      <div className="not-found-image">
        {/* You can replace this with an actual image or SVG */}
        <div className="lost-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <path d="M15 3h6v6"></path>
            <path d="M10 14L21 3"></path>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default NotFound;