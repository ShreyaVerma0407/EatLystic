// src/Components/Navbar.jsx

import React from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import "../styles/Navbar.css"; // Adjust the path if needed

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo-cluster">
        <span className="emoji">🍴</span>
        <span className="logo-text">EATLYSTIC</span>
        <span className="emoji">🏃</span>
      </div>
      <ul className="nav-links">
        <li>
          <Link to="/home" className="home-link">Home</Link> {/* Added className */}
        </li>
        <li>KitchenVault</li>
        <li>MealCraft</li>
        <li>HealthSync</li>
        <li>Settings</li>
        <li>Login</li>
      </ul>
    </nav>
  );
};

export default Navbar; // ✅ This line is ESSENTIAL for default import!
