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
import Navbar from "./Navbar"; // Assuming Navbar is in the same directory

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
  const pageRef = useRef(); // 🔹 for container reference
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const CART_BASE_URL = API_BASE_URL.replace("/api", "");
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [recentlyAdded, setRecentlyAdded] = useState([]);

  // ✅ Try to get recipe from navigation state (liked page) or fallback to food.json
  let recipe = location.state?.recipe;

  useEffect(() => {
    if (!recipe) {
      // If no recipe in state, fetch from food.json
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

  // If recipe still isn't found, show an error message
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
  //for shopping cart
 useEffect(() => {
  const userId = localStorage.getItem("userId");
  if (!userId) return;

  // Get cart from localStorage first
  const localCart = JSON.parse(localStorage.getItem("cartItems") || "[]");

  // Fetch backend cart
  fetch(`${CART_BASE_URL}/cart/${userId}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        // Merge backend cart with localStorage cart
        const backendCart = data.cart || [];
        const mergedCart = [...backendCart];

        localCart.forEach((lcItem) => {
          const exists = mergedCart.find((b) => b.name === lcItem.name);
          if (exists) {
            exists.quantity += lcItem.quantity;
          } else {
            mergedCart.push(lcItem);
          }
        });

        setCartItems(mergedCart);
        localStorage.setItem("cartItems", JSON.stringify(mergedCart));
      } else {
        // fallback: just use localStorage cart
        setCartItems(localCart);
      }
    })
    .catch((err) => {
      console.error("Error fetching cart:", err);
      setCartItems(localCart);
    });
}, []);


  // ⭐ NEW: fetch dish image from Unsplash
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

  // ⭐ NEW: fetch ingredient images from Edamam
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
  // 🔹 Add pantryItems state to Dish.jsx
  const [pantryItems, setPantryItems] = useState([]);

  // Fetch pantry items on load
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

  // Helper: get ingredient badge
  // Normalize string into lowercase singular words
  const normalizeWords = (str) =>
    str
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .split(" ")
      .map(pluralize.singular);

  // Helper: get badge for ingredient
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

    return "Sufficient"; // ✅ Always return something
  };

  const totalSteps = recipe.instructions?.length || 0;
  const progress = totalSteps ? ((currentStep + 1) / totalSteps) * 100 : 0;

  // 🔹 Handle "Done" button click
  // 🔹 Handle "Done" button click
  const handleDone = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/recipes/cooked`, {
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
  //helper function for shopping cart
   const addToCart = async (itemName) => {
  const userId = localStorage.getItem("userId");
  if (!userId) return alert("Please login to add items to cart.");

  const existing = cartItems.find(i => i.name === itemName);

  const updatedCart = existing
    ? cartItems.map(i =>
        i.name === itemName ? { ...i, quantity: i.quantity + 1 } : i
      )
    : [...cartItems, { name: itemName, quantity: 1 }];

  setCartItems(updatedCart);
  localStorage.setItem("cartItems", JSON.stringify(updatedCart));

  // Update backend
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

  // Update favoriteRecipes
  const currentRecipes = JSON.parse(localStorage.getItem("favoriteRecipes") || "[]");
  if (!currentRecipes.find((r) => r.name === recipe.name)) {
    localStorage.setItem(
      "favoriteRecipes",
      JSON.stringify([...currentRecipes, recipe])
    );
  }
};

  // 🔹 Handle "Download Recipe" button click
  const handleDownloadPDF = () => {
    if (!recipe) return;

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Title
    pdf.setFontSize(22);
    pdf.setTextColor(250, 204, 21); // yellow
    pdf.text(recipe.name, pageWidth / 2, 20, { align: "center" });

    let y = 35;

    // Cuisine + Type + Prep Time
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

    // Ingredients
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

    // Instructions
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

    // Nutrition Facts
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

    // Save file
    pdf.save(`${recipe.name}_recipe.pdf`);
  };

  return (
    <>
      <Navbar /> {/* Render the Navbar component here */}
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
        {/* 🔹 Download Button */}
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

        {/* Title */}
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

        {/* ⭐ Dish Image */}
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

        {/* Details */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
            gap: 12,
            marginBottom: 48,
            justifyItems: "center",
          }}
        >
          <div style={cardStyle}>
            <ChefHat size={24} style={{ margin: "0 auto 8px" }} />
            <p style={{ opacity: 0.8, marginBottom: 4 }}>Ingredients</p>
            <p style={{ fontWeight: "bold", fontSize: 18 }}>
              {recipe.ingredients?.length || 0}
            </p>
          </div>
          <div style={cardStyle}>
            <Badge text={recipe.cuisine || "Unknown"} />
            <p style={{ opacity: 0.8 }}>Cuisine</p>
          </div>
          <div style={cardStyle}>
            <Leaf
              size={20}
              color={
                recipe.type?.toLowerCase() === "vegetarian"
                  ? "#22c55e"
                  : "#db2777"
              }
              style={{
                marginBottom: 4,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            />
            <p style={{ fontWeight: "bold", textTransform: "capitalize" }}>
              {recipe.type || "N/A"}
            </p>
          </div>
          <div style={cardStyle}>
            <Clock size={24} style={{ margin: "0 auto 8px" }} />
            <p style={{ opacity: 0.8, marginBottom: 4 }}>Prep Time</p>
            <p style={{ fontWeight: "bold", fontSize: 18 }}>
              {recipe.prep_time || "N/A"}
            </p>
          </div>
        </div>

        
        {/* Ingredients Section */}
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
            const badge = getIngredientBadge(item); // ✅ always returns a badge now

            // Set badge color based on status
            const badgeColor =
              badge === "Missing"
                ? "#22c55e"
                : badge === "Low Stock"
                ? "orange"
                : badge === "Expiring"
                ? "red"
                : "#4472CA"; // Sufficient

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

        {/*       Cooking Process with Step Progress */}
        {totalSteps > 0 && (
          <div style={{ maxWidth: 700, margin: "0 auto 48px" }}>
            <h2 style={sectionHeading}>👨‍🍳 Cooking Process</h2>

            {/* Step Counter */}
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

            {/* Step Content */}
            <div style={stepCard}>{recipe.instructions[currentStep]}</div>

            {/* Progress Bar */}
            <div style={progressContainer}>
              <div style={{ ...progressFill, width: `${progress}%` }}></div>
            </div>

            {/* Controls */}
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

        {/* ⭐ Nutrition Section */}
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
  textAlign: "center",
  padding: 16,
  backgroundColor: "rgba(255 255 255 / 0.1)",
  borderRadius: 12,
};

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