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

const Dishes_meal = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [dishImage, setDishImage] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [recentlyAdded, setRecentlyAdded] = useState([]);
  const pageRef = useRef();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(location.state?.recipeDetails || null);
  const [loading, setLoading] = useState(true);

  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    if (recipe) {
      setLoading(false);
      return;
    }

    const fetchRecipeFromData = async () => {
      try {
        const res = await fetch("/data/food.json");
        const data = await res.json();
        const allRecipes = Array.isArray(data) ? data : data.recipes;

        const foundRecipe = allRecipes.find(
          (r) =>
            r.id === id ||
            r.name.toLowerCase() === decodeURIComponent(id).toLowerCase()
        );

        if (foundRecipe) {
          setRecipe(foundRecipe);
        } else {
          setRecipe(null);
        }
      } catch (err) {
        console.error("Error loading food.json:", err);
        setRecipe(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeFromData();
  }, [id, recipe]);

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
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const CART_BASE_URL = import.meta.env.VITE_CART_BASE_URL;
    fetch(`${CART_BASE_URL}/cart/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") setCartItems(data.cart);
      })
      .catch((err) => console.error("Error fetching cart:", err));
  }, []);

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
      const CART_BASE_URL = import.meta.env.VITE_CART_BASE_URL;
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
    if (recipe.prep_minutes) {
      pdf.text(`Prep Time: ${recipe.prep_minutes} minutes`, 14, y);
      y += 12;
    }
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text("🛒 Ingredients", 14, y);
    y += 8;
    (recipe.ingredients || []).forEach((ing) => {
      pdf.text(`• ${ing.name}`, 20, y);
      y += 7;
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }
    });
    y += 10;
    if (recipe.steps?.length) {
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text("👨‍🍳 Cooking Steps", 14, y);
      y += 10;
      pdf.setFontSize(12);
      recipe.steps.forEach((step, idx) => {
        const lines = pdf.splitTextToSize(
          `${idx + 1}. ${step.instruction}`,
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
    if (recipe.nutrition_per_serving) {
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text("⚡ Nutrition Facts", 14, y);
      y += 10;
      pdf.setFontSize(12);
      Object.entries(recipe.nutrition_per_serving).forEach(([key, value]) => {
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

  const totalSteps = recipe?.steps?.length || 0;
  const progress = totalSteps ? ((currentStep + 1) / totalSteps) * 100 : 0;

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
      navigate("/recipe/mealchef");
    } catch (err) {
      console.error("Error saving recipe:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
        <h2>Loading recipe...</h2>
        <p>Please wait a moment.</p>
      </div>
    );
  }

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
        <p>You may have refreshed the page or the recipe does not exist.</p>
      </div>
    );
  }

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
            textDecoration: "underline",
          }}
        >
          {recipe.name}
        </h1>
        <div
          style={{
            maxWidth: "500px",
            height: "300px",
            margin: "0 auto 32px",
            borderRadius: "12px",
            border: "2px solid #facc15",
            overflow: "hidden",
          }}
        >
          {dishImage && (
            <img
              src={dishImage}
              alt={recipe.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          )}
        </div>
        <div
          style={{
            display: "flex", // ✅ Changed to flexbox
            justifyContent: "center", // ✅ Centered the divs
            gap: "10px", // ✅ Set distance to 10px
            marginBottom: 48,
          }}
        >
          <div
            style={{
              ...cardStyle,
              ...hoverEffect(hoveredCard === "ingredients"),
              borderColor: "#fff700ff",
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
              borderColor: "#fff700ff",
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
              ...hoverEffect(hoveredCard === "prep-time"),
              borderColor: "#fff700ff",
            }}
            onMouseEnter={() => setHoveredCard("prep-time")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <span role="img" aria-label="prep-time-emoji" style={{ fontSize: "2.5rem" }}>🔪</span>
            <p style={{ opacity: 0.8, marginBottom: 4 }}>Prep Time</p>
            <p style={{ fontWeight: "bold", fontSize: 18 }}>
              {recipe.prep_minutes || "N/A"} mins
            </p>
          </div>
          <div
            style={{
              ...cardStyle,
              ...hoverEffect(hoveredCard === "cook-time"),
              borderColor: "#fff700ff",
            }}
            onMouseEnter={() => setHoveredCard("cook-time")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <span role="img" aria-label="cook-time-emoji" style={{ fontSize: "2.5rem" }}>🔥</span>
            <p style={{ opacity: 0.8, marginBottom: 4 }}>Cook Time</p>
            <p style={{ fontWeight: "bold", fontSize: 18 }}>
              {recipe.cook_minutes || "N/A"} mins
            </p>
          </div>
        </div>

        <h2 style={{ ...sectionHeading, textDecoration: "underline" }}>
          🛒 Ingredients
        </h2>
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
            return (
              <div key={idx} style={ingredientBox("#222", "#fefce8")}>
                <span style={dot("#facc15")}></span>
                <span style={{ flex: 1 }}>{item.name}</span>
                <ShoppingCart
                  size={20}
                  style={{ cursor: "pointer", opacity: 0.7 }}
                  onClick={() => addToCart(item.name)}
                />
              </div>
            );
          })}
        </div>

        <div style={{ maxWidth: 700, margin: "0 auto 48px" }}>
          <h2 style={{ ...sectionHeading, textDecoration: "underline" }}>
            👨‍🍳 Cooking Process
          </h2>
          {totalSteps > 0 ? (
            <>
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
              <div style={stepCard}>
                {recipe.steps[currentStep].instruction}
              </div>
              <div style={progressContainer}>
                <div style={{ ...progressFill, width: `${progress}%` }}></div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                  onClick={() =>
                    setCurrentStep((prev) => Math.max(prev - 1, 0))
                  }
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
                      setCurrentStep((prev) =>
                        Math.min(prev + 1, totalSteps - 1)
                      )
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
            </>
          ) : (
            <p
              style={{
                textAlign: "center",
                fontStyle: "italic",
                opacity: 0.7,
              }}
            >
              Cooking steps are not available for this recipe.
            </p>
          )}
        </div>

        <div style={{ marginTop: 60, textAlign: "center" }}>
          <h2 style={{ ...sectionHeading, textDecoration: "underline" }}>
            ⚡ Nutrition Facts
          </h2>
          {recipe.nutrition_per_serving &&
          Object.keys(recipe.nutrition_per_serving).length > 0 ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 30,
                flexWrap: "wrap",
              }}
            >
              {Object.entries(recipe.nutrition_per_serving).map(
                ([key, value]) => (
                  <div key={key} style={nutritionCircle}>
                    <p style={{ fontSize: 20, fontWeight: "bold" }}>{value}</p>
                    <p style={{ fontSize: 14, opacity: 0.8 }}>{key}</p>
                  </div>
                )
              )}
            </div>
          ) : (
            <p
              style={{
                textAlign: "center",
                fontStyle: "italic",
                opacity: 0.7,
              }}
            >
              Nutritional information is not available for this recipe.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

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

export default Dishes_meal;