import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Welcome.css";

const Welcome = () => {
  const navigate = useNavigate();
  const [slideOut, setSlideOut] = useState(false);

  const handleSlide = () => {
    setSlideOut(true);
    setTimeout(() => {
      navigate("/home");
    }, 2000); // match CSS transition time
  };

  return (
    <div
      className={`welcome-page ${slideOut ? "slide-out" : ""}`}
      onMouseEnter={handleSlide} // hover triggers slide
    >
      <div className="bg-img"></div>
      <div className="center-text">
        <div className="welcome-container">
          <div className="welcome">WELCOME TO</div>
          <div className="eatlystic">EATLYSTIC</div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
