// src/Components/HeroSection.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const FILTERS = [
  { name: "All", key: "" },
  { name: "Chef", key: "chef" },
  { name: "Plan", key: "plan" },
  { name: "Liked", key: "liked" },
  { name: "Favorite", key: "favorite" },
  { name: "Customise", key: "customise" }
];

const CARD_SETS = {
  chef: [
    { name: "PantryChef", route: "/recipe/pantrychef", img: "/images/pantrychef.jpg" },
    { name: "MasterChef", route: "/recipe/masterchef", img: "/images/masterchef.jpg" },
    { name: "MacrosChef", route: "/recipe/macroschef", img: "/images/macroschef.jpg" },
    { name: "MealPlanChef", route: "/recipe/mealplan", img: "/images/mealplanchef.jpg" },
    { name: "FavChef", route: "/recipe/favchef", img: "/images/favchef.jpg" },
    { name: "Trending", route: "/recipe/trending", img: "/images/trending.png" }
  ],
  plan: [
    { name: "MealPlanChef", route: "/recipe/mealplan", img: "/images/mealplanchef.jpg" }
  ],
  liked: [
    { name: "Likes", route: "/recipe/likes", img: "/images/liked.jpg" }
  ],
  favorite: [
    { name: "FavChef", route: "/recipe/favchef", img: "/images/favchef.jpg" },
    { name: "Likes", route: "/recipe/likes", img: "/images/liked.jpg" }
  ],
  customise: [
    { name: "Customise", route: "/recipe/customise", img: "/images/customise.jpg" },
    { name: "Alias", route: "/recipe/alias", img: "/images/alias.jpg" }
  ]
};

const ALL_CARDS_UNIQUE = (() => {
  const map = new Map();
  Object.values(CARD_SETS).flat().forEach(card => {
    if (!map.has(card.name)) map.set(card.name, card);
  });
  return Array.from(map.values());
})();

const HeroSection = () => {
  const [showContent, setShowContent] = useState(false);
  const [activeFilter, setActiveFilter] = useState("");
  const navigate = useNavigate();

  const cardsToShow = activeFilter ? CARD_SETS[activeFilter] || [] : ALL_CARDS_UNIQUE;

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* 🔥 Smooth sliding background */}
      <motion.div
        initial={{ y: "0vh" }}
        animate={{ y: showContent ? "-100vh" : "0vh" }}
        transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1] }} // smooth cubic-bezier
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
        }}
      />

      {/* Landing Section */}
      {!showContent && (
        <div
          style={{
            position: "fixed",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -40%)",
            textAlign: "center",
            zIndex: 3,
          }}
        >
          <h1
            style={{
              fontSize: "8rem",
              fontWeight: "bold",
              color: "black",
              WebkitTextStroke: "4px orange",
              marginBottom: "1.2rem"
            }}
          >
            Plan Well <br /> Eat Well
          </h1>
          <button
            style={{
              padding: "16px 48px",
              fontSize: "1.7rem",
              fontWeight: "bold",
              color: "white",
              background: "orange",
              border: "none",
              borderRadius: "32px",
              cursor: "pointer",
              transition: "background 0.3s"
            }}
            onMouseEnter={e => e.target.style.background = "#ff7300"}
            onMouseLeave={e => e.target.style.background = "orange"}
            onClick={() => setShowContent(true)}
          >
            Explore
          </button>
        </div>
      )}

      {/* Main Content */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ y: "100vh" }}
            animate={{ y: 0 }}
            exit={{ y: "100vh" }}
            transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1] }}
            style={{
              background: "#fff",
              minHeight: "100vh",
              position: "relative",
              zIndex: 3
            }}
          >
            {/* Title */}
            <div
              style={{
                padding: "3rem 2rem 1rem 2rem",
                fontSize: "4.5rem",
                fontWeight: "bold",
                color: "orange"
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
                alignItems: "center",
                flexWrap: "wrap",
                borderBottom: "2px solid #f0f0f0",
                backgroundColor: "#fffaf5",
              }}
            >
              {FILTERS.map((filter) => (
                <button
                  key={filter.key}
                  style={{
                    background: activeFilter === filter.key ? "orange" : "#fff",
                    border: `2px solid ${activeFilter === filter.key ? "orange" : "#ddd"}`,
                    boxShadow: activeFilter === filter.key ? "0 4px 10px rgba(255, 165, 0, 0.4)" : "none",
                    color: activeFilter === filter.key ? "white" : "orange",
                    fontSize: "1.3rem",
                    fontWeight: 600,
                    padding: "0.7rem 1.6rem",
                    cursor: "pointer",
                    borderRadius: "22px",
                  }}
                  onClick={() => setActiveFilter(filter.key)}
                >
                  {filter.name}
                </button>
              ))}
            </div>

            {/* Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "3rem",
                padding: "3rem 5rem 5rem",
                justifyItems: "center",
                backgroundColor: "#fffaf5",
              }}
            >
              {cardsToShow.map((card) => (
                <div
                  key={card.name}
                  style={{
                    background: "white",
                    border: "4px solid #ededed",
                    borderRadius: "22px",
                    textAlign: "center",
                    padding: "2rem 1.5rem 1rem 1.5rem",
                    cursor: "pointer",
                    minWidth: "250px",
                    maxWidth: "300px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                  onClick={() => navigate(card.route)}
                >
                  <img
                    src={card.img}
                    alt={card.name}
                    style={{
                      width: "220px",
                      height: "220px",
                      borderRadius: "20px",
                      objectFit: "cover",
                      boxShadow: "0 8px 20px #fde9c6",
                      marginBottom: "1.6rem",
                    }}
                  />
                  <div
                    style={{
                      fontWeight: "bold",
                      fontSize: "1.4rem",
                      color: "#222",
                      minHeight: "2.6rem",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                    }}
                  >
                    {card.name}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeroSection;
