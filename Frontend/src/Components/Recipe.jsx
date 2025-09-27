import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
 import "../styles/recipe.css";
 import Footer from "./Footer";

const FILTERS = [
  { name: "All", key: "" },
  { name: "Chef", key: "chef" },
  { name: "Plan", key: "plan" },
  { name: "Liked", key: "liked" },
  { name: "Favorite", key: "favorite" },
  { name: "Customise", key: "customise" },
];

const CARD_SETS = {
  chef: [
    { name: "PantryChef", route: "/recipe/pantrychef", img: "/images/pantrychef.jpg" },
    { name: "MealChef", route: "/recipe/mealchef", img: "/images/mealchef.png" },
    { name: "MacrosChef", route: "/recipe/macroschef", img: "/images/macroschef.jpg" },
    { name: "PlanChef", route: "/recipe/mealplan", img: "/images/mealplanchef.jpg" },
    { name: "Trending", route: "/recipe/trending", img: "/images/trending.png" },
  ],
  plan: [{ name: "PlanChef", route: "/recipe/mealplan", img: "/images/mealplan.png" }],
  liked: [{ name: "Likes", route: "/recipe/liked", img: "/images/liked.jpg" }],
  favorite: [
    { name: "Likes", route: "/recipe/liked", img: "/images/liked.jpg" },
  ],
  customise: [
    { name: "Customise", route: "/recipe/customise", img: "/images/customise.jpg" },
  ],
};

// Build unique "All" set
const ALL_CARDS_UNIQUE = (() => {
  const seen = new Set();
  const flat = Object.values(CARD_SETS).flat();
  const unique = [];
  for (const c of flat) {
    if (!seen.has(c.name)) {
      seen.add(c.name);
      unique.push(c);
    }
  }
  return unique;
})();

const HeroSection = () => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const [activeFilter, setActiveFilter] = useState("");

  const cardsToShow = useMemo(
    () => (activeFilter ? CARD_SETS[activeFilter] || [] : ALL_CARDS_UNIQUE),
    [activeFilter]
  );

  return (
    <div style={{ position: "relative", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <Navbar /> {/* Navbar added at the top */}

      {/* Background */}
      <motion.div
        initial={{ y: "0vh" }}
        animate={{ y: showContent ? "-100vh" : "0vh" }}
        transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1] }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100vh",
          backgroundImage: "url('/images/bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* Landing Page */}
      {!showContent && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 30,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "auto",
          }}
        >
          <div style={{ textAlign: "center", padding: "0 16px" }}>
            <motion.h1
             className="hero-heading"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              style={{
                fontSize: "6rem",
                fontWeight: "bold",
                color: "white",
                marginBottom: "2rem",
                textShadow: "4px 4px 0px rgba(0,0,0,0.3)",
                WebkitTextStroke: "2px #FF7043",
                display: "flex",
                gap: "1rem",
              }}
            >
              Plan Well
              <span
                style={{
                  background: "linear-gradient(90deg, #FF7043, #FF5722)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Eat Well
              </span>
            </motion.h1>
            <motion.button
              onClick={() => setShowContent(true)}
              style={{
                padding: "20px 60px",
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "white",
                background: "linear-gradient(90deg, #FF7043, #FF5722)",
                border: "none",
                borderRadius: "32px",
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(255,112,67,0.4)",
              }}
            >
              Explore Recipes
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              background: "linear-gradient(to bottom, #fffaf5, #ffe5d4)",
              minHeight: "100vh",
              position: "relative",
              zIndex: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              overflow: "hidden",
              paddingBottom: "3rem",
            }}
          >
            {/* Wave background */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 0,
                overflow: "hidden",
                pointerEvents: "none",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1440 320"
                preserveAspectRatio="none"
                style={{ display: "block", width: "100%", height: "100%" }}
              >
                <path
                  fill="#FF7043"
                  fillOpacity="0.2"
                  d="M0,64L40,85.3C80,107,160,149,240,165.3C320,181,400,171,480,154.7C560,139,640,117,720,106.7C800,96,880,96,960,117.3C1040,139,1120,181,1200,176C1280,171,1360,117,1400,90.7L1440,64L1440,320L0,320Z"
                />
                <path
                  fill="#FF7043"
                  fillOpacity="0.1"
                  d="M0,192L40,181.3C80,171,160,149,240,165.3C320,181,400,235,480,245.3C560,256,640,224,720,186.7C800,149,880,107,960,117.3C1040,128,1120,192,1200,197.3C1280,203,1360,149,1400,122.7L1440,96L1440,320L0,320Z"
                />
              </svg>
            </div>

            {/* Title */}
            <div
              style={{
                padding: "3rem 2rem 1rem 2rem",
                fontSize: "4.5rem",
                fontWeight: "bold",
                color: "#FF7043",
                textAlign: "center",
              }}
            >
              Recipe
            </div>

            {/* Filters */}
            <div
              style={{
                padding: "0 2rem 2rem 2rem",
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                borderBottom: "2px solid #ffd6b0",
                background: "linear-gradient(90deg, #fffaf5, #ffe5d4)",
                justifyContent: "center",
                marginBottom: "2rem",
              }}
            >
              {FILTERS.map((filter, i) => (
                <button
                  key={`${filter.key}-${i}`}
                  style={{
                    background: activeFilter === filter.key ? "#FF7043" : "#fff",
                    border: `2px solid ${activeFilter === filter.key ? "#FF7043" : "#ddd"}`,
                    boxShadow:
                      activeFilter === filter.key ? "0 4px 10px rgba(255,112,67,0.4)" : "none",
                    color: activeFilter === filter.key ? "white" : "#FF7043",
                    fontSize: "1.3rem",
                    fontWeight: 600,
                    padding: "0.7rem 1.6rem",
                    cursor: "pointer",
                    borderRadius: "22px",
                    transition: "all 0.3s",
                  }}
                  onClick={() => setActiveFilter(filter.key)}
                >
                  {filter.name}
                </button>
              ))}
            </div>

            <div
              style={{
                display: cardsToShow.length === 1 ? "flex" : "grid",
                justifyContent: cardsToShow.length === 1 ? "center" : "initial",
                gridTemplateColumns:
                  cardsToShow.length === 1 ? "none" : "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "2rem",
                width: "90%",
                maxWidth: "1200px",
                zIndex: 2,
              }}
            >
              {cardsToShow.map((card, idx) => (
                <motion.div
                  key={`${card.name}-${idx}`}
                  whileHover={{
                    scale: 1.05,
                    border: "3px solid #FF7043", // Orange Border on Hover
                  }}
                  style={{
                    background: "#fff",
                    borderRadius: "20px",
                    overflow: "hidden",
                    cursor: "pointer",
                    boxShadow: "0 8px 20px rgba(255,112,67,0.2)",
                    transition: "all 0.3s", // Smooth transition for hover effect
                    width: cardsToShow.length === 1 ? "320px" : "100%", // keep single card neat size
                  }}
                  onClick={() => navigate(card.route)}
                >
                  <motion.img
                    src={card.img}
                    alt={card.name}
                    style={{ width: "100%", height: "220px", objectFit: "cover" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  <div
                    style={{
                      padding: "1rem",
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "1.3rem",
                      color: "#FF7043",
                    }}
                  >
                    {card.name}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
   {showContent && <Footer />}

      {/* Keyframes */}
      <style>{`@keyframes gradientAnimation {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }`}</style>
    </div>
  );
};

export default HeroSection;
