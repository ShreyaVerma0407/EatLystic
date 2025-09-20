import React, { useState, useEffect, useRef } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  ChefHat,
  Clock,
  Leaf,
  ShoppingCart,
  ArrowLeft,
  ArrowRight,
  Download,
} from "lucide-react";
import jsPDF from "jspdf";
import pluralize from "pluralize";
import Navbar from "./Navbar";

// 🌟 Simple Badge component
const Badge = ({ text }) => (
  <span
    style={{
      backgroundColor: "rgba(255,255,255,0.1)",
      borderRadius: "12px",
      padding: "4px 12px",
      fontSize: "14px",
      fontWeight: "bold",
      color: "#fff",
      display: "inline-block",
      marginBottom: "4px",
    }}
  >
    {text}
  </span>
);

const Dish = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [foodData, setFoodData] = useState([]);
  const [saving, setSaving] = useState(false);
  const [dishImage, setDishImage] = useState(null);
  const [ingredientImages, setIngredientImages] = useState({});
  const pageRef = useRef();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const CART_BASE_URL = API_BASE_URL.replace("/api", "");
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);

  let recipe = location.state?.recipe;

  useEffect(() => {
    if (!recipe) {
      fetch("/data/food.json")
        .then((res) => res.json())
        .then((data) => {
          setFoodData(data);
          recipe = data.find(
            (r) => r.name.toLowerCase() === decodeURIComponent(id).toLowerCase()
          );
        })
        .catch((err) => console.error("Error loading food.json:", err));
    }
  }, [id, recipe]);

  if (!recipe) {
    return (
      <div
        style={{
          backgroundColor: "#181824",
          color: "white",
          minHeight: "100vh",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h2>⚠ Recipe not found</h2>
        <p>You may have refreshed the page or navigated directly.</p>
      </div>
    );
  }

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    fetch(`${CART_BASE_URL}/cart/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") setCartItems(data.cart);
      })
      .catch((err) => console.error("Error fetching cart:", err));
  }, []);

  useEffect(() => {
    if (recipe?.name) {
      const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_KEY;
      fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          recipe.name
        )}&client_id=${UNSPLASH_KEY}&per_page=1`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.results?.[0]?.urls?.small) {
            setDishImage(data.results[0].urls.small);
          }
        })
        .catch((err) => console.error("Unsplash error:", err));
    }
  }, [recipe]);

  useEffect(() => {
    if (recipe?.ingredients?.length) {
      const APP_ID = import.meta.env.VITE_EDAMAM_APP_ID;
      const APP_KEY = import.meta.env.VITE_EDAMAM_APP_KEY;

      recipe.ingredients.forEach((ing) => {
        fetch(
          `https://api.edamam.com/api/food-database/v2/parser?app_id=${APP_ID}&app_key=${APP_KEY}&ingr=${encodeURIComponent(
            ing
          )}`
        )
          .then((res) => res.json())
          .then((data) => {
            const img = data.parsed?.[0]?.food?.image;
            if (img) {
              setIngredientImages((prev) => ({ ...prev, [ing]: img }));
            }
          })
          .catch((err) => console.error("Edamam error:", err));
      });
    }
  }, [recipe]);

  const [pantryItems, setPantryItems] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    fetch(`${API_BASE_URL}/pantry/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") setPantryItems(data.data);
      })
      .catch((err) => console.error("Error fetching pantry:", err));
  }, []);

  const normalizeWords = (str) =>
    str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .split(" ")
      .map(pluralize.singular);

  const getIngredientBadge = (ingredientName) => {
    const ingWords = normalizeWords(ingredientName);

    const pantryItem = pantryItems.find((p) => {
      const pantryWords = normalizeWords(p.name);
      return pantryWords.some((w) => ingWords.includes(w));
    });

    if (!pantryItem || pantryItem.quantity < 1) return "Missing";
    if (pantryItem.expiryDate && new Date(pantryItem.expiryDate) <= new Date())
      return "Expiring";
    if (pantryItem.quantity <= 2) return "Low Stock";

    return "Sufficient";
  };

  const totalSteps = recipe.instructions?.length || 0;
  const progress = totalSteps ? ((currentStep + 1) / totalSteps) * 100 : 0;

  const handleDone = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/api/recipes/cooked`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: recipe.name,
          ingredients: recipe.ingredients,
          nutritionalContent: recipe.nutrition || {},
        }),
      });

      const data = await res.json();
      console.log("Saved to Atlas:", data);

      navigate("/recipe/pantrychef");
    } catch (err) {
      console.error("Error saving recipe:", err);
    } finally {
      setSaving(false);
    }
  };

  const addToCart = async (itemName) => {
    const userId = localStorage.getItem("userId");
    if (!userId) return alert("Please login to add items to cart.");

    const existing = cartItems.find((i) => i.name === itemName);
    let updatedCart = existing
      ? cartItems.map((i) =>
          i.name === itemName ? { ...i, quantity: i.quantity + 1 } : i
        )
      : [...cartItems, { name: itemName, quantity: 1 }];

    setCartItems(updatedCart);

    setRecentlyAdded((prev) => [
      { name: itemName, quantity: 1 },
      ...prev.filter((i) => i.name !== itemName),
    ]);

    try {
      await fetch(`${CART_BASE_URL}/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, item: { name: itemName, quantity: 1 } }),
      });
      alert(`"${itemName}" added to cart!`);
    } catch (err) {
      console.error("Error syncing cart:", err);
    }

    const currentRecipes = JSON.parse(
      localStorage.getItem("favoriteRecipes") || "[]"
    );
    if (!currentRecipes.find((r) => r.name === recipe.name)) {
      localStorage.setItem(
        "favoriteRecipes",
        JSON.stringify([...currentRecipes, recipe])
      );
    }
  };

  const handleDownloadPDF = () => {
    if (!recipe) return;

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();

    pdf.setFontSize(22);
    pdf.setTextColor(250, 204, 21);
    pdf.text(recipe.name, pageWidth / 2, 20, { align: "center" });

    let y = 35;

    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    if (recipe.cuisine) {
      pdf.text(`Cuisine: ${recipe.cuisine}`, 14, y);
      y += 8;
    }
    if (recipe.type) {
      pdf.text(`Type: ${recipe.type}`, 14, y);
      y += 8;
    }
    if (recipe.prep_time) {
      pdf.text(`Prep Time: ${recipe.prep_time}`, 14, y);
      y += 12;
    }

    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text("🛒 Ingredients", 14, y);
    y += 8;

    pdf.setFontSize(12);
    (recipe.ingredients || []).forEach((ing) => {
      pdf.text(`• ${ing}`, 20, y);
      y += 7;
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }
    });

    y += 10;

    if (recipe.instructions?.length) {
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text("👨‍🍳 Cooking Steps", 14, y);
      y += 10;

      pdf.setFontSize(12);
      recipe.instructions.forEach((step, idx) => {
        const lines = pdf.splitTextToSize(
          `${idx + 1}. ${step}`,
          pageWidth - 30
        );
        pdf.text(lines, 20, y);
        y += lines.length * 7 + 3;

        if (y > 270) {
          pdf.addPage();
          y = 20;
        }
      });
    }

    y += 10;

    if (recipe.nutrition) {
      pdf.setFontSize(16);
      pdf.text("⚡ Nutrition Facts", 14, y);
      y += 10;

      pdf.setFontSize(12);
      Object.entries(recipe.nutrition).forEach(([key, value]) => {
        pdf.text(`${key}: ${value}`, 20, y);
        y += 7;
        if (y > 270) {
          pdf.addPage();
          y = 20;
        }
      });
    }

    pdf.save(`${recipe.name}_recipe.pdf`);
  };

  return (
    <>
      <Navbar />
      <div
        style={{
          backgroundColor: "#181824",
          minHeight: "100vh",
          padding: "2rem 3rem",
          color: "white",
          position: "relative",
        }}
        ref={pageRef}
      >
        <button
          onClick={handleDownloadPDF}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            padding: "8px 16px",
            backgroundColor: "#facc15",
            color: "#000",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Download size={18} /> Download Recipe
        </button>

        <h1
          style={{
            fontSize: 48,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 24,
            color: "#ffcc00",
          }}
        >
          {recipe.name}
        </h1>

        {dishImage && (
          <img
            src={dishImage}
            alt={recipe.name}
            style={{
              maxWidth: "400px",
              height: "auto",
              margin: "0 auto 32px",
              borderRadius: "12px",
              display: "block",
            }}
          />
        )}

        {/* 💥 CORRECTED: Apply the full hover and border effects with fixed width and gap */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginBottom: 48,
          }}
        >
          <div
            style={{
              ...cardStyle,
              ...hoverEffect(hoveredCard === "ingredients"),
              borderColor: "#00ff00",
            }}
            onMouseEnter={() => setHoveredCard("ingredients")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <span role="img" aria-label="ingredients-emoji" style={{ fontSize: "2.5rem" }}>📝</span>
            <p style={{ opacity: 0.8, marginBottom: 4 }}>Ingredients</p>
            <p style={{ fontWeight: "bold", fontSize: 18 }}>
              {recipe.ingredients?.length || 0}
            </p>
          </div>
          <div
            style={{
              ...cardStyle,
              ...hoverEffect(hoveredCard === "cuisine"),
              borderColor: "#ff00ff",
            }}
            onMouseEnter={() => setHoveredCard("cuisine")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <span role="img" aria-label="cuisine-emoji" style={{ fontSize: "2.5rem" }}>🌍</span>
            <Badge text={recipe.cuisine || "Unknown"} />
            <p style={{ opacity: 0.8 }}>Cuisine</p>
          </div>
          <div
            style={{
              ...cardStyle,
              ...hoverEffect(hoveredCard === "type"),
              borderColor: "#00ffff",
            }}
            onMouseEnter={() => setHoveredCard("type")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <span role="img" aria-label="type-emoji" style={{ fontSize: "2.5rem" }}>🌿</span>
            <p style={{ fontWeight: "bold", textTransform: "capitalize", marginBottom: 4 }}>
              {recipe.type || "N/A"}
            </p>
            <p style={{ opacity: 0.8 }}>Type</p>
          </div>
          <div
            style={{
              ...cardStyle,
              ...hoverEffect(hoveredCard === "prepTime"),
              borderColor: "#ffc107",
            }}
            onMouseEnter={() => setHoveredCard("prepTime")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <span role="img" aria-label="prep-time-emoji" style={{ fontSize: "2.5rem" }}>🔪</span>
            <p style={{ opacity: 0.8, marginBottom: 4 }}>Prep Time</p>
            <p style={{ fontWeight: "bold", fontSize: 18 }}>
              {recipe.prep_time || "N/A"}
            </p>
          </div>
        </div>

        <h2 style={sectionHeading}>🛒 Ingredients</h2>
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto 48px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          {(recipe.ingredients || []).map((item, idx) => {
            const badge = getIngredientBadge(item);
            const badgeColor =
              badge === "Missing"
                ? "#22c55e"
                : badge === "Low Stock"
                ? "orange"
                : badge === "Expiring"
                ? "red"
                : "#4472CA";

            return (
              <div key={idx} style={ingredientBox("#222", "#fefce8")}>
                {ingredientImages[item] ? (
                  <img
                    src={ingredientImages[item]}
                    alt={item}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span style={dot("#facc15")}></span>
                )}
                <span style={{ flex: 1 }}>{item}</span>
                {badge && (
                  <span
                    style={{
                      marginRight: "6px",
                      padding: "2px 8px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      backgroundColor: badgeColor,
                      color: "white",
                    }}
                  >
                    {badge}
                  </span>
                )}
                <ShoppingCart
                  size={20}
                  style={{ cursor: "pointer", opacity: 0.7 }}
                  onClick={() => addToCart(item)}
                />
              </div>
            );
          })}
        </div>

        {totalSteps > 0 && (
          <div style={{ maxWidth: 700, margin: "0 auto 48px" }}>
            <h2 style={sectionHeading}>👨‍🍳 Cooking Process</h2>
            <p
              style={{
                textAlign: "center",
                marginBottom: 8,
                fontWeight: "bold",
                fontSize: 18,
              }}
            >
              Step {currentStep + 1} of {totalSteps}
            </p>
            <div style={stepCard}>{recipe.instructions[currentStep]}</div>
            <div style={progressContainer}>
              <div style={{ ...progressFill, width: `${progress}%` }}></div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
                style={{
                  ...navButton,
                  opacity: currentStep === 0 ? 0.5 : 1,
                  cursor: currentStep === 0 ? "not-allowed" : "pointer",
                }}
                disabled={currentStep === 0}
              >
                <ArrowLeft size={18} /> Prev
              </button>
              {currentStep < totalSteps - 1 ? (
                <button
                  onClick={() =>
                    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1))
                  }
                  style={navButton}
                >
                  Next <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  onClick={handleDone}
                  style={{
                    ...navButton,
                    backgroundColor: "#facc15",
                    color: "#000",
                    fontWeight: "bold",
                  }}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Done"}
                </button>
              )}
            </div>
          </div>
        )}

        {recipe.nutrition && (
          <div style={{ marginTop: 60, textAlign: "center" }}>
            <h2 style={sectionHeading}>⚡ Nutrition Facts</h2>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 30,
                flexWrap: "wrap",
              }}
            >
              {Object.entries(recipe.nutrition).map(([key, value]) => (
                <div key={key} style={nutritionCircle}>
                  <p style={{ fontSize: 20, fontWeight: "bold" }}>{value}</p>
                  <p style={{ fontSize: 14, opacity: 0.8 }}>{key}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// 🔹 helper styles
const cardStyle = {
  width: "250px", // ✅ Corrected width
  textAlign: "center",
  padding: 10,
  backgroundColor: "rgba(255,255,255,0.1)",
  borderRadius: 12,
  border: "2px solid",
  transition: "all 0.3s ease",
};
const hoverEffect = (isHovered) => ({
  borderColor: isHovered ? "#ffcc00" : "inherit",
  boxShadow: isHovered ? "0 0 10px #ffcc00" : "none",
});

const ingredientBox = (bg, textColor) => ({
  padding: 12,
  backgroundColor: bg,
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  gap: 12,
  color: textColor,
});

const dot = (bg) => ({
  width: 12,
  height: 12,
  backgroundColor: bg,
  borderRadius: "9999px",
  flexShrink: 0,
});

const sectionHeading = {
  fontSize: 28,
  fontWeight: "bold",
  marginBottom: 20,
  color: "#fef3c7",
  textAlign: "center",
};

const stepCard = {
  backgroundColor: "rgba(255,255,255,0.05)",
  padding: 24,
  borderRadius: 12,
  textAlign: "center",
  minHeight: 120,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 16,
  fontSize: 18,
  border: "1px solid rgba(255,255,255,0.2)",
  transition: "all 0.3s ease",
};

const progressContainer = {
  height: 10,
  borderRadius: 8,
  background: "rgba(255,255,255,0.1)",
  overflow: "hidden",
  marginBottom: 16,
};

const progressFill = {
  height: "100%",
  background: "#facc15",
  transition: "width 0.3s ease-in-out",
};

const navButton = {
  padding: "8px 16px",
  background: "rgba(255,255,255,0.1)",
  border: "none",
  borderRadius: 8,
  color: "white",
  display: "flex",
  alignItems: "center",
  gap: 6,
  cursor: "pointer",
};

const nutritionCircle = {
  width: 100,
  height: 100,
  borderRadius: "50%",
  border: "3px solid #facc15",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  boxShadow: "0 0 10px #facc15, 0 0 20px #facc15",
};

export default Dish;