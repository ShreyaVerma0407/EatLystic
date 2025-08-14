import React, { useEffect } from 'react';
import '../styles/Welcome.css'; // Importing the styles for the Welcome page

const Welcome = () => {
  useEffect(() => {
    // Redirect after animation is done (2s slide + 1.3s text animation)
    setTimeout(() => {
      window.location.href = 'Home.jsx'; // Redirect to index.html
    }, 4000); // Adjust delay as needed (2s slide + 1.3s text animation)
  }, []);

  return (
    <div className="App">
      <div className="bg-img"></div>
      <div className="center-text">
        <div className="welcome-container">
          <div className="welcome">WELCOME TO</div>
          <div className="eatlystic">EATLYSTIC</div>
        </div>
      </div>
    </div>
  );
}

export default Welcome;