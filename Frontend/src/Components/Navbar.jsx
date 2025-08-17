// src/Components/Navbar.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import "../styles/Navbar.css"; // Adjust the path if needed

const Navbar = () => {
  const [kitchenVaultOpen, setKitchenVaultOpen] = useState(false);
  const [healthSyncOpen, setHealthSyncOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="logo-cluster">
        <span className="emoji">🍴</span>
        <span className="logo-text">EATLYSTIC</span>
        <span className="emoji">🏃</span>
      </div>
      <ul className="nav-links">
        <li>
          <Link to="/home" className="home-link">
            Home
          </Link>{" "}
          {/* Added className */}
        </li>

        {/* KitchenVault dropdown */}
        <li
          className="dropdown"
          onMouseEnter={() => setKitchenVaultOpen(true)}
          onMouseLeave={() => setKitchenVaultOpen(false)}
          style={{ position: "relative" }}
        >
          KitchenVault
          {kitchenVaultOpen && (
            <ul className="dropdown-menu" style={dropdownMenuStyle}>
              <li>
                <Link to="/pantry" className="dropdown-link">
                  Pantry
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* MealCraft normal menu item */}
        <li>MealCraft</li>

        {/* HealthSync dropdown */}
        <li
          className="dropdown"
          onMouseEnter={() => setHealthSyncOpen(true)}
          onMouseLeave={() => setHealthSyncOpen(false)}
          style={{ position: "relative" }}
        >
          HealthSync
          {healthSyncOpen && (
            <ul className="dropdown-menu" style={dropdownMenuStyle}>
              <li>
                <Link to="/calorie" className="dropdown-link">
                  CalorieCount
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Other menu items */}
        <li>Settings</li>
        <li>Login</li>
      </ul>
    </nav>
  );
};

const dropdownMenuStyle = {
  position: "absolute",
  top: "100%",
  left: 0,
  backgroundColor: "#fff",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  borderRadius: "4px",
  padding: "8px 0",
  zIndex: 1000,
  minWidth: "140px",
};

export default Navbar; // ✅ This line is ESSENTIAL for default import!
