import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation(); // For active link highlight

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Overlay for mobile menu */}
      <div
        className={`nav-overlay ${isOpen ? "active" : ""}`}
        onClick={closeMenu}
      ></div>

      <nav className="navbar">
        {/* Logo */}
        <div className="logo-cluster">
          <span className="emoji">🍴</span>
          <span className="logo-text">EATLYSTIC</span>
          <span className="emoji">🏃</span>
        </div>

        {/* Hamburger for mobile */}
        <div className="hamburger" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Navigation Links */}
        <ul className={`nav-links ${isOpen ? "open" : ""}`}>
          {[
            { path: "/home", label: "Home" },
            { path: "/pantry", label: "Pantry" },
            { path: "/nutrient", label: "NutriLog" },
            { path: "/calorie", label: "CaloriFi" },
            { path: "/fitness", label: "Trackify" },
            { path: "/recipe", label: "Mealify" },
            { path: "/pantryreport", label: "StockStat" },
            { path: "/shoppingcart", label: "Cartify" },
            { path: "/helpdesk", label: "Help Desk" },
            { path: "/logout", label: "Logout" },
          ].map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? "active" : ""}`}
                onClick={closeMenu} // close menu on link click
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default Navbar;