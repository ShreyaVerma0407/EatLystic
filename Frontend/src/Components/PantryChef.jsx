import React, { useState, useEffect } from "react";
import { FaClock, FaListUl, FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_KEY;
const EDAMAM_ID = import.meta.env.VITE_EDAMAM_APP_ID;
const EDAMAM_KEY = import.meta.env.VITE_EDAMAM_APP_KEY;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PEXELS_KEY = import.meta.env.VITE_PEXELS_KEY;

const PantryChef = ({ currentUserId }) => {
  const [pantryItems, setPantryItems] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [matchingRecipes, setMatchingRecipes] = useState([]);
  const [images, setImages] = useState({});
  const [favorites, setFavorites] = useState({});

  const navigate = useNavigate();

  // 🔹 Fetch pantry items
  useEffect(() => {
    if (!currentUserId) return;

    fetch(`${API_BASE_URL}/pantry/${currentUserId}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.status === "success" && Array.isArray(result.data)) {
          setPantryItems(result.data);
        }
      })
      .catch((err) => console.error("Error fetching pantry:", err));
  }, [currentUserId]);

  // 🔹 Fetch recipe list and food types
  useEffect(() => {
    fetch("/data/food.json")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setFoodItems(data);
        else if (Array.isArray(data.recipes)) setFoodItems(data.recipes);
      })
      .catch((err) => console.error("Error fetching food.json:", err));
  }, []);

  // 🔹 Filter recipes with 3+ pantry matches
  useEffect(() => {
    if (pantryItems.length === 0 || foodItems.length === 0) {
      setMatchingRecipes([]);
      return;
    }

    const pantryNames = pantryItems.map((item) =>
      item.name.toLowerCase().trim()
    );

    const filtered = foodItems.map((recipe, idx) => {
      // ✅ CORRECTED: Ensure recipeId is unique to prevent key warnings
      const recipeId = recipe.id || `${recipe.name}-${idx}`;

      if (!Array.isArray(recipe.ingredients)) return null;

      const matchCount = recipe.ingredients.reduce((count, ingredient) => {
        if (typeof ingredient !== "string") return count;
        const ing = ingredient.toLowerCase();
        const found = pantryNames.some((p) => ing.includes(p));
        return found ? count + 1 : count;
      }, 0);

      return matchCount >= 3 ? { ...recipe, recipeId } : null;
    });

    setMatchingRecipes(filtered.filter(Boolean));
  }, [pantryItems, foodItems]);

  // 🔹 Fetch recipe images
  useEffect(() => {
  matchingRecipes.forEach(async (recipe) => {
    if (images[recipe.recipeId]) return; // already fetched

    let imageUrl = "";

    // 1️⃣ Try Pexels first
    try {
      const pexelsRes = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(recipe.name)}&per_page=1`,
        {
          headers: {
            Authorization: PEXELS_KEY,
          },
        }
      );
      const pexelsData = await pexelsRes.json();
      if (pexelsData?.photos?.length > 0) {
        imageUrl = pexelsData.photos[0].src.medium;
      }
    } catch (err) {
      console.warn("Pexels failed:", err);
    }

    // 2️⃣ Fallback to Edamam
    if (!imageUrl) {
      try {
        const edamamRes = await fetch(
          `https://api.edamam.com/search?q=${encodeURIComponent(
            recipe.name
          )}&app_id=${EDAMAM_ID}&app_key=${EDAMAM_KEY}&from=0&to=1`
        );
        const edamamData = await edamamRes.json();
        if (edamamData?.hits?.length > 0) {
          imageUrl = edamamData.hits[0].recipe.image;
        }
      } catch (err) {
        console.warn("Edamam failed:", err);
      }
    }

    // 3️⃣ Fallback to local placeholder
    if (!imageUrl) {
      imageUrl = "/images/placeholder-food.jpg"; // put a good placeholder in public/images
    }

    // Save image
    setImages((prev) => ({ ...prev, [recipe.recipeId]: imageUrl }));
  });
}, [matchingRecipes, images]);
  // 🔹 Fetch liked recipes for current user
  useEffect(() => {
    if (!currentUserId) return;

    // ✅ CORRECTED: Removed duplicate '/api' from the URL
    fetch(`${API_BASE_URL}/liked/${currentUserId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success" && Array.isArray(data.data)) {
          const likedMap = {};
          data.data.forEach((recipe) => {
            likedMap[recipe.recipeId] = true;
          });
          setFavorites(likedMap);
        }
      })
      .catch((err) => console.error("Error fetching liked recipes:", err));
  }, [currentUserId]);

  // 🔹 Toggle favorite (with backend sync + full recipe details)
  const toggleFavorite = async (recipe, e) => {
    e.stopPropagation();
    const recipeId = recipe.recipeId;
    const isFav = favorites[recipeId];

    try {
      if (isFav) {
        // ✅ CORRECTED: Removed duplicate '/api' from the URL
        await fetch(`${API_BASE_URL}/liked`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUserId, recipeId }),
        });
      } else {
        // ✅ CORRECTED: Removed duplicate '/api' from the URL
        await fetch(`${API_BASE_URL}/liked`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUserId,
            recipeId,
            name: recipe.name,
            ingredients: recipe.ingredients,
            prep_time: recipe.prep_time,
            type: recipe.type,
            image: images[recipe.recipeId] || recipe.image,
          }),
        });
      }

      setFavorites((prev) => ({
        ...prev,
        [recipeId]: !isFav,
      }));
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const handleRecipeClick = (recipe) => {
    navigate(`/recipe/pantrychef/dishes/${recipe.recipeId}`, {
      state: { recipe, image: images[recipe.recipeId] },
    });
  };

  return (
    <>
      <Navbar />
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          background: "linear-gradient(to bottom, #1e1e1e, #121212)",
          color: "#fff",
          padding: "2rem 1rem",
        }}
      >
        <h2
  style={{
    textAlign: "center",
    paddingBottom: "2rem",
    fontSize: "2.2rem",
    background: "linear-gradient(90deg, #ff9800, #ffee58, #ff6b6b, #ff9800)",
    backgroundSize: "300% 300%",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: "bold",
    animation: "gradientAnimation 5s ease infinite",
  }}
>
  🍳 Matching Recipes
</h2>
        {matchingRecipes.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "2rem",
              justifyItems: "center",
              padding: "0 2rem",
              maxWidth: "1200px",
              margin: "0 auto",
            }}
          >
            {matchingRecipes.map((recipe, index) => (
  <div
    key={recipe.recipeId}
    onClick={() => handleRecipeClick(recipe)}
    style={{
      background: "#2a2a3a", // clean dark card
      borderRadius: "20px",
      overflow: "hidden",
      width: "100%",
      maxWidth: "320px",
      cursor: "pointer",
      boxShadow: "0 10px 20px rgba(0,0,0,0.4)",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      position: "relative",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-5px) scale(1.03)";
      e.currentTarget.style.boxShadow = "0 20px 30px rgba(255, 152, 0, 0.6)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0) scale(1)";
      e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.4)";
    }}
  >
    {/* Favorite Heart */}
    <FaHeart
      onClick={(e) => toggleFavorite(recipe, e)}
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        fontSize: "1.5rem",
        color: favorites[recipe.recipeId] ? "#ff4757" : "#bbb",
        cursor: "pointer",
        zIndex: 2,
      }}
    />

    {/* Recipe Image */}
    <div
      style={{
        width: "160px",
        height: "160px",
        borderRadius: "50%",
        overflow: "hidden",
        marginTop: "1rem",
        boxShadow: "0 8px 15px rgba(0,0,0,0.5)",
      }}
    >
      <img
        src={images[recipe.recipeId] || recipe.image || "https://via.placeholder.com/150"}
        alt={recipe.name}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>

    {/* Recipe Info */}
    <div style={{ textAlign: "center", padding: "1rem", width: "100%" }}>
      <h3
        style={{
          fontSize: "1.3rem",
          margin: "0.5rem 0",
          fontWeight: "600",
          color: "#fff",
        }}
      >
        {recipe.name}
      </h3>

      <p style={{ margin: "0.3rem 0", color: "#ccc", fontSize: "0.9rem" }}>
        <FaClock style={{ marginRight: "5px" }} />
        {recipe.prep_time || "N/A"} min
      </p>

      <p style={{ margin: "0.3rem 0", color: "#ccc", fontSize: "0.9rem" }}>
        <FaListUl style={{ marginRight: "5px" }} />
        {recipe.ingredients ? recipe.ingredients.length : 0} ingredients
      </p>

      {/* Type Pill */}
      <span
        style={{
          display: "inline-block",
          marginTop: "0.5rem",
          padding: "0.4rem 1rem",
          borderRadius: "20px",
          fontSize: "0.8rem",
          fontWeight: "bold",
          background: "linear-gradient(45deg, #ff6b6b, #ffcc33)",
          color: "#000",
        }}
      >
        {recipe.type || "Unknown"}
      </span>
    </div>
  </div>
))}

          </div>
        ) : (
          <p style={{ textAlign: "center" }}>
            No recipes match at least 3 ingredients from your pantry.
          </p>
        )}
      </div>
    </>
  );
};

export default PantryChef;