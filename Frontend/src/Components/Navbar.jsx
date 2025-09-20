// src/Components/Navbar.jsx

import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

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
          <Link to="/home" className="home-link">Home</Link>
        </li>
        <li>
          <Link to="/pantry" className="nav-link">Pantry</Link>
        </li>
        <li>
          <Link to="/nutrient" className="nav-link">NutriLog</Link>
        </li>
        <li>
          <Link to="/calorie" className="nav-link">CaloriFi</Link>
        </li>
        <li>
          <Link to="/recipe" className="nav-link">Mealify</Link>
        </li>
        <li>
          <Link to="/pantryreport" className="nav-link">StockStat</Link>
        </li>
        <li>
          <Link to="/shoppingcart" className="nav-link">Cartify</Link>
        </li>
        <li>
          <Link to="/helpdesk" className="nav-link">Help Desk</Link>
        </li>
        <li><Link to="/logout" className="nav-link">Logout</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
