import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Show confirmation popup
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  // Confirm logout: clear auth, redirect, show alert
  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userInfo");
    navigate("/login");
    setTimeout(() => alert("Please login again to explore Eatlystic"), 300);
  };

  // Cancel logout, hide confirmation popup
  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="logo-cluster">
          <span className="emoji">🍴</span>
          <span className="logo-text">EATLYSTIC</span>
          <span className="emoji">🏃</span>
        </div>

        <ul className="nav-links">
          <li>
            <Link to="/home" className="nav-link">Home</Link>
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
          <li>
            <button
              onClick={handleLogoutClick}
              className="nav-link"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                font: "inherit",
                color: "inherit",
              }}
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>

      {/* Confirmation Popup */}
      {showLogoutConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            width: "100vw",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "#f37736",
              padding: "2rem",
              borderRadius: "10px",
              maxWidth: "320px",
              width: "90%",
              textAlign: "center",
              color: "white",
            }}
          >
            <p style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>
              Are you sure you want to logout?
            </p>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <button
                onClick={handleConfirmLogout}
                style={{
                  backgroundColor: "#cc0000",
                  color: "white",
                  padding: "0.7rem 1.5rem",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Yes
              </button>
              <button
                onClick={handleCancelLogout}
                style={{
                  backgroundColor: "#999999",
                  color: "white",
                  padding: "0.7rem 1.5rem",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
