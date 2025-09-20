import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Welcome.css";

const Welcome = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")); // read user object

  const goToHome = () => {
    navigate("/home");
  };

  return (
    <div className="welcome-page">
      <div className="bg-img"></div>
      <div className="center-text">
        <div className="welcome-container">
          <div className="welcome">
            {user ? `Welcome ${user.name}` : "Welcome"}
          </div>
          <div className="eatlystic">To EATLYSTIC</div>
          <button className="enter-btn" onClick={goToHome}>
            Explore
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
