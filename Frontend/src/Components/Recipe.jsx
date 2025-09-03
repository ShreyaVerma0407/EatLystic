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

// Remove duplicates and get unique cards
const ALL_CARDS_UNIQUE = (() => {
  const map = new Map();
  Object.values(CARD_SETS).flat().forEach(card => {
    if (!map.has(card.name)) map.set(card.name, card);
  });
  return Array.from(map.values());
})();

const HeroSection = () => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const [activeFilter, setActiveFilter] = useState("");

  const [centerIndex, setCenterIndex] = useState(() =>
    Math.floor(ALL_CARDS_UNIQUE.length / 2)
  );

  const cardsToShow = activeFilter ? CARD_SETS[activeFilter] || [] : ALL_CARDS_UNIQUE;

  const navigateCarousel = (direction) => {
    if (direction === "left") {
      setCenterIndex(prev => (prev > 0 ? prev - 1 : cardsToShow.length - 1));
    } else {
      setCenterIndex(prev => (prev < cardsToShow.length - 1 ? prev + 1 : 0));
    }
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
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
                  onClick={() => {
                    setActiveFilter(filter.key);
                    const newCards = filter.key ? CARD_SETS[filter.key] : ALL_CARDS_UNIQUE;
                    setCenterIndex(Math.floor(newCards.length / 2));
                  }}
                >
                  {filter.name}
                </button>
              ))}
            </div>

            {/* 3D Carousel */}
            {cardsToShow.length > 0 && (
              <div
                style={{
                  position: "relative",
                  height: "420px",
                  overflow: "hidden",
                  padding: "3rem 0",
                  backgroundColor: "#fffaf5",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* Left/Right Buttons */}
                <button
                  style={{
                    position: "absolute",
                    left: "2rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 20,
                    padding: "1rem",
                    fontSize: "2rem",
                    cursor: "pointer",
                    borderRadius: "50%",
                    background: "orange",
                    color: "white",
                    border: "none",
                  }}
                  onClick={() => navigateCarousel("left")}
                >
                  ◀
                </button>
                <button
                  style={{
                    position: "absolute",
                    right: "2rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 20,
                    padding: "1rem",
                    fontSize: "2rem",
                    cursor: "pointer",
                    borderRadius: "50%",
                    background: "orange",
                    color: "white",
                    border: "none",
                  }}
                  onClick={() => navigateCarousel("right")}
                >
                  ▶
                </button>

                {/* Cards */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    perspective: "1500px",
                  }}
                >
                  {cardsToShow.map((card, index) => {
                    const offset = index - centerIndex;
                    const absOffset = Math.abs(offset);
                    const isCenter = offset === 0;

                    const scale = isCenter ? 1.15 : 0.85;
                    const translateX = offset * 260;
                    const translateZ = isCenter ? 100 : -200;
                    const opacity = isCenter ? 1 : 0.5;
                    const blur = isCenter ? "none" : "blur(3px)";

                    return (
                      <motion.div
                        key={card.name}
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          width: "280px",
                          height: "360px",
                          transform: `translate(-50%, -50%) translateX(${translateX}px) translateZ(${translateZ}px) scale(${scale})`,
                          opacity,
                          zIndex: isCenter ? 20 : 10 - absOffset,
                          cursor: "pointer",
                          transition: "transform 0.6s, opacity 0.6s",
                          filter: blur,
                        }}
                        onClick={() => navigate(card.route)}
                      >
                        <div
                          style={{
                            background: "#fff",
                            borderRadius: "20px",
                            overflow: "hidden",
                            boxShadow: isCenter
                              ? "0 12px 30px rgba(255,165,0,0.4)"
                              : "0 4px 10px rgba(255,165,0,0.2)",
                          }}
                        >
                          <img
                            src={card.img}
                            alt={card.name}
                            style={{
                              width: "100%",
                              height: "220px",
                              objectFit: "cover",
                            }}
                          />
                          <div
                            style={{
                              padding: "1rem",
                              textAlign: "center",
                              fontWeight: "bold",
                              fontSize: "1.3rem",
                              color: "orange",
                            }}
                          >
                            {card.name}
                          </div>
                          <div
                            style={{
                              textAlign: "center",
                              fontSize: "1rem",
                              color: "#666",
                            }}
                          >
                            Balanced nutrition
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeroSection;
