// src/components/PantryChef.jsx
import React, { useState, useEffect } from "react";
import { FaClock, FaListUl, FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_KEY;
const EDAMAM_ID = import.meta.env.VITE_EDAMAM_APP_ID;
const EDAMAM_KEY = import.meta.env.VITE_EDAMAM_APP_KEY;

const PantryChef = ({ currentUserId }) => {
  const [pantryItems, setPantryItems] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [matchingRecipes, setMatchingRecipes] = useState([]);
  const [images, setImages] = useState({});
  const [favorites, setFavorites] = useState({}); // recipeId -> true/false

  const navigate = useNavigate();

  // 🔹 Fetch pantry items
  useEffect(() => {
    if (!currentUserId) return;

    fetch(`http://localhost:3001/api/pantry/${currentUserId}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.status === "success" && Array.isArray(result.data)) {
          setPantryItems(result.data);
        }
      })
      .catch((err) => console.error("Error fetching pantry:", err));
  }, [currentUserId]);

  // 🔹 Fetch recipe list
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
      const recipeId = recipe.id || recipe.name || `recipe-${idx}`;

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
      if (images[recipe.recipeId]) return;

      let imageUrl = "";

      try {
        const unsplashRes = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
            recipe.name
          )}&client_id=${UNSPLASH_KEY}`
        );
        const unsplashData = await unsplashRes.json();
        if (unsplashData?.results?.length > 0) {
          imageUrl = unsplashData.results[0].urls.small;
        }
      } catch (err) {
        console.warn("Unsplash failed:", err);
      }

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

      if (imageUrl) {
        setImages((prev) => ({ ...prev, [recipe.recipeId]: imageUrl }));
      }
    });
  }, [matchingRecipes]);

  // 🔹 Fetch liked recipes for current user
  useEffect(() => {
    if (!currentUserId) return;

    fetch(`http://localhost:3001/api/liked/${currentUserId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success" && Array.isArray(data.liked)) {
          const likedMap = {};
          data.liked.forEach((id) => {
            likedMap[id] = true;
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
        // unlike
        await fetch("http://localhost:3001/api/liked", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUserId, recipeId }),
        });
      } else {
        // like with details
        await fetch("http://localhost:3001/api/liked", {
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

      // Update UI instantly
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
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#181824",
        color: "#fff",
        padding: "2rem 1rem",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          paddingBottom: "2rem",
          fontSize: "2.2rem",
        }}
      >
        🍳 Matching Recipes
      </h2>

      {matchingRecipes.length > 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            alignItems: "center",
          }}
        >
          {matchingRecipes.map((recipe, index) => (
            <div
              key={recipe.recipeId}
              onClick={() => handleRecipeClick(recipe)}
              style={{
                backgroundColor: "#2c2f3f",
                borderRadius: "15px",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                maxWidth: "400px",
                width: "100%",
                position: "relative",
                cursor: "pointer",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.03)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              {/* ❤️ Heart icon */}
              <FaHeart
                onClick={(e) => toggleFavorite(recipe, e)}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  fontSize: "1.3rem",
                  cursor: "pointer",
                  transition: "color 0.3s ease",
                  color: favorites[recipe.recipeId] ? "red" : "#888",
                }}
              />

              {/* Recipe Image */}
              <div
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <img
                  src={
                    images[recipe.recipeId] ||
                    recipe.image ||
                    "https://via.placeholder.com/90"
                  }
                  alt={recipe.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>

              {/* Recipe Info */}
              <div style={{ marginLeft: "1rem", flex: 1 }}>
                <h3
                  style={{
                    fontSize: "1.2rem",
                    margin: 0,
                    marginBottom: "0.5rem",
                    textTransform: "lowercase",
                  }}
                >
                  {recipe.name}
                </h3>

                <p
                  style={{
                    margin: "0.3rem 0",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "0.9rem",
                    color: "#ccc",
                  }}
                >
                  <FaClock style={{ marginRight: "5px" }} />
                  {recipe.prep_time || "N/A"} min
                </p>

                <p
                  style={{
                    margin: "0.3rem 0",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "0.9rem",
                    color: "#ccc",
                  }}
                >
                  <FaListUl style={{ marginRight: "5px" }} />
                  {recipe.ingredients ? recipe.ingredients.length : 0}{" "}
                  ingredients
                </p>

                {/* Yellow Badge */}
                <span
                  style={{
                    display: "inline-block",
                    marginTop: "0.5rem",
                    padding: "0.3rem 0.8rem",
                    borderRadius: "15px",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    backgroundColor: "#ffee58",
                    color: "#000",
                  }}
                >
                  {recipe.type === "Vegetarian"
                    ? "vegan food"
                    : recipe.type === "Non-Vegetarian"
                    ? "saturated with fats"
                    : "full of protein"}
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
  );
};

export default PantryChef;
