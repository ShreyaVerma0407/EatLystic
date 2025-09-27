import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const imageSet = ['/images/macrosbg.png'];

export default function LandingPage() {
  const navigate = useNavigate();
  const imageUrl = imageSet[0];

  // Recommend adding this effect to control body overflow
  React.useEffect(() => {
    // Hide overflow when this page is mounted
    document.body.style.overflow = "hidden";
    document.body.style.width = "100%";
    return () => {
      // Reset when unmounting
      document.body.style.overflow = "";
      document.body.style.width = "";
    };
  }, []);

  const handleGetStarted = () => {
    // Navigate to the correct path
    navigate("/recipe/macroschef/dash");
  };

  return (
    <>
      <div
        style={{
          position: "sticky",
          top: 0,
          width: "100%",
          zIndex: 1000,
          background: "rgba(0,0,0,0.2)",
        }}
      >
        <Navbar />
      </div>

      <div
        style={{
          position: "relative",
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "scroll",
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "center",
          color: "white",
          textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1,
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 2,
            width: "80%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "10vh",
          }}
        >
          <h1
            style={{
              fontSize: "10vw",
              fontWeight: "900",
              color: "#ff5f00",
              marginBottom: "1rem",
              width: "100%",
              textAlign: "center",
              fontFamily: "Roboto, Helvetica, Arial, sans-serif",
            }}
          >
            MacroChef
          </h1>
          <p
            style={{
              fontSize: "2.0vw",
              fontWeight: "500",
              width: "80%",
              textAlign: "center",
              margin: "0 0 1.3rem 0",
              whiteSpace: "normal",
              overflow: "visible",
              textOverflow: "clip",
              lineHeight: "1.25",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            Your One-Shot Solution for Personalized Nutrition & Smart Meal Planning
          </p>
          <button
            onClick={handleGetStarted}
            style={{
              marginBottom: "5.5rem",
              backgroundColor: "#ff5f00",
              color: "white",
              padding: "0.5vw 1.6vw",
              fontSize: "0.9vw",
              border: "none",
              borderRadius: "35px",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
              textTransform: "uppercase",
              fontWeight: "600",
              boxShadow: "0 2.5px 5px rgba(0,0,0,0.1)",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#e55600")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#ff5f00")}
          >
            Get Started
          </button>
        </div>
      </div>
    </>
  );
}
