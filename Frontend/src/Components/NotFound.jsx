import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/NotFound.css"; // You can style it as needed

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/"); // Redirects to the home page
  };

  return (
    <div className="not-found">
      <h1>404</h1>
      <p>Oops! The page you're looking for doesn't exist.</p>
      <button onClick={handleGoHome}>Go to Home</button>
    </div>
  );
};

export default NotFound;
