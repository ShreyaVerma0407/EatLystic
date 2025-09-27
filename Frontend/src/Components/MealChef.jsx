import React, { useState, useEffect, useMemo } from "react";
import { FaClock, FaFire, FaHeart, FaListUl } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from './Footer';

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_KEY;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PEXELS_KEY = import.meta.env.VITE_PEXELS_KEY;

const MealChef = ({ currentUserId }) => {
  const [foodItems, setFoodItems] = useState([]);
  const [matchingRecipes, setMatchingRecipes] = useState([]);
  const [images, setImages] = useState({});
  const [favorites, setFavorites] = useState({});
  const navigate = useNavigate();

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDiet, setSelectedDiet] = useState("All");
  const [maxPrepTime, setMaxPrepTime] = useState("");
  const [maxCookTime, setMaxCookTime] = useState("");
  const [maxIngredients, setMaxIngredients] = useState("");

  useEffect(() => {
    fetch("/data/food.json")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setFoodItems(data);
        else if (Array.isArray(data.recipes)) setFoodItems(data.recipes);
      })
      .catch((err) => console.error("Error fetching food.json:", err));
  }, []);

  const allRecipesWithIds = useMemo(() => {
    return foodItems.map((recipe, idx) => ({
      ...recipe,
      recipeId: recipe.id || `${recipe.name}-${idx}`,
    }));
  }, [foodItems]);

  useEffect(() => {
    setMatchingRecipes(allRecipesWithIds);
  }, [allRecipesWithIds]);

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

  useEffect(() => {
    if (!currentUserId) return;
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

  // ✅ CORRECTED: Map the ingredients to an array of strings
  const toggleFavorite = async (recipe, e) => {
    e.stopPropagation();
    const recipeId = recipe.recipeId;
    const isFav = favorites[recipeId];
    try {
      if (isFav) {
        await fetch(`${API_BASE_URL}/liked`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUserId, recipeId }),
        });
      } else {
        // Corrected: Extract only the 'name' from the ingredients array
        const ingredientNames = Array.isArray(recipe.ingredients)
          ? recipe.ingredients.map(ing => ing.name).filter(Boolean)
          : [];

        await fetch(`${API_BASE_URL}/liked`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUserId,
            recipeId,
            name: recipe.name,
            ingredients: ingredientNames,
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
    const recipeId = recipe.recipeId;
    const recipeDetails = {
      ...recipe,
      image: images[recipeId] || recipe.image || "https://via.placeholder.com/400x200",
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions || [],
      prep_time: recipe.prep_time || "N/A",
      cook_time: recipe.cook_time || "N/A",
      servings: recipe.servings || "N/A",
      nutrition: recipe.nutrition || {},
      category: recipe.category || "Uncategorized",
    };
    navigate(`/recipe/mealchef/dishes/${recipeId}`, {
      state: { recipeDetails },
    });
  };

  const filteredAndSortedRecipes = useMemo(() => {
    let filtered = [...matchingRecipes];

    if (searchTerm) {
      filtered = filtered.filter((recipe) =>
        recipe.name && recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDiet !== "All") {
      filtered = filtered.filter((recipe) => recipe.type === selectedDiet);
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((recipe) => recipe.category === selectedCategory);
    }

    if (maxPrepTime) {
      const parsedTime = parseInt(maxPrepTime);
      if (!isNaN(parsedTime)) {
        filtered = filtered.filter((recipe) => {
          const recipeTime = parseInt(recipe.prep_time);
          return !isNaN(recipeTime) && recipeTime <= parsedTime;
        });
      }
    }

    if (maxCookTime) {
      const parsedTime = parseInt(maxCookTime);
      if (!isNaN(parsedTime)) {
        filtered = filtered.filter((recipe) => {
          const recipeTime = parseInt(recipe.cook_time);
          return !isNaN(recipeTime) && recipeTime <= parsedTime;
        });
      }
    }

    if (maxIngredients) {
      const parsedCount = parseInt(maxIngredients);
      if (!isNaN(parsedCount)) {
        filtered = filtered.filter(
          (recipe) => recipe.ingredients && recipe.ingredients.length <= parsedCount
        );
      }
    }

    const recipesWithImages = filtered.filter(
      (recipe) => images[recipe.recipeId]
    );
    const recipesWithoutImages = filtered.filter(
      (recipe) => !images[recipe.recipeId]
    );

    return [...recipesWithImages, ...recipesWithoutImages];
  }, [
    matchingRecipes,
    images,
    searchTerm,
    selectedDiet,
    selectedCategory,
    maxPrepTime,
    maxCookTime,
    maxIngredients,
  ]);

  const allCategories = useMemo(() => {
    const categories = foodItems.map((item) => item.category).filter(Boolean);
    return ["All", ...new Set(categories)];
  }, [foodItems]);

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
          fontFamily: "sans-serif",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            paddingBottom: "2rem",
            fontSize: "4.5rem",
            fontWeight: "bold",
            color: "orange",
            textDecoration: "underline",
            textShadow: "3px 3px 8px white",
            textTransform: "uppercase",
          }}
        >
          Meal Chef
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            marginBottom: "2rem",
            padding: "1rem",
            borderRadius: "10px",
            border: "2px solid #ff9800",
            backgroundColor: "#2c2f3f",
            maxWidth: "1200px",
            margin: "0 auto 2rem",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
            <h3 style={{ margin: 0, color: "#ff9800" }}>Filter By:</h3>
            <select
              value={selectedDiet}
              onChange={(e) => setSelectedDiet(e.target.value)}
              style={filterInputStyle}
            >
              <option value="All">All Diets</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Non-Vegetarian">Non-Vegetarian</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={filterInputStyle}
            >
              {allCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Max Prep Time (min)"
              value={maxPrepTime}
              onChange={(e) => setMaxPrepTime(e.target.value)}
              style={filterInputStyle}
            />

            <input
              type="number"
              placeholder="Max Cook Time (min)"
              value={maxCookTime}
              onChange={(e) => setMaxCookTime(e.target.value)}
              style={filterInputStyle}
            />

            <input
              type="number"
              placeholder="Max Ingredients"
              value={maxIngredients}
              onChange={(e) => setMaxIngredients(e.target.value)}
              style={filterInputStyle}
            />
          </div>

          <input
            type="text"
            placeholder="Search recipes by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              ...filterInputStyle,
              width: "100%",
              boxSizing: "border-box",
            }}
          />
        </div>

        {filteredAndSortedRecipes.length > 0 ? (
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
            {filteredAndSortedRecipes.map((recipe) => (
              <div
                key={recipe.recipeId}
                onClick={() => handleRecipeClick(recipe)}
                style={{
                  backgroundColor: "#2c2f3f",
                  borderRadius: "10px",
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                  maxWidth: "400px",
                  position: "relative",
                  cursor: "pointer",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  boxShadow: "0 8px 15px rgba(0, 0, 0, 0.3)",
                  boxSizing: "border-box",
                  border: "none",
                   color: "#fff",
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
                <FaHeart
                  onClick={(e) => toggleFavorite(recipe, e)}
                  style={{
                    position: "absolute",
                    top: "15px",
                    right: "15px",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    transition: "color 0.3s ease",
                    color: favorites[recipe.recipeId] ? "red" : "#888",
                    filter: favorites[recipe.recipeId]
                      ? "drop-shadow(0 0 5px red)"
                      : "none",
                  }}
                />
                <div
                  style={{
                    width: "100%",
                    height: "200px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    marginBottom: "1rem",
                    border: "4px solid #e56617",
                  }}
                >
                  <img
                    src={
                      images[recipe.recipeId] ||
                      recipe.image ||
                      "https://via.placeholder.com/400x200"
                    }
                    alt={recipe.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div style={{ textAlign: "center", width: "100%" }}>
                  <h3
                    style={{
                      fontSize: "1.5rem",
                      margin: 0,
                      marginBottom: "0.5rem",
                      textTransform: "capitalize",
                      color: "#ffc107",
                    }}
                  >
                    {recipe.name}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "1rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        display: "flex",
                        alignItems: "center",
                        fontSize: "0.9rem",
                        color: "#ccc",
                      }}
                    >
                      <FaClock style={{ marginRight: "5px" }} />
                      {recipe.prep_time || "N/A"}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        display: "flex",
                        alignItems: "center",
                        fontSize: "0.9rem",
                        color: "#ccc",
                      }}
                    >
                      <FaFire style={{ marginRight: "5px" }} />
                      {recipe.cook_time || "N/A"}
                    </p>
                  </div>
                  <p
                    style={{
                      margin: "0.3rem 0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.9rem",
                      color: "#ccc",
                    }}
                  >
                    <FaListUl style={{ marginRight: "5px" }} />
                    {recipe.ingredients ? recipe.ingredients.length : 0}{" "}
                    ingredients
                  </p>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "0.4rem 1rem",
                      borderRadius: "20px",
                      fontSize: "0.85rem",
                      fontWeight: "bold",
                      backgroundColor: "#ffee58",
                      color: "#000",
                      textTransform: "uppercase",
                    }}
                  >
                    {recipe.category || "Uncategorized"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: "center", fontSize: "1.2rem", color: "#ccc" }}>
            No recipes available that match your filters.
          </p>
        )}
      </div><Footer/>
    </>
  );
};

const filterInputStyle = {
  padding: "0.5rem 0.8rem",
  borderRadius: "5px",
  border: "1px solid #555",
  backgroundColor: "#3a3d4f",
  color: "#fff",
  fontSize: "1rem",
  flexGrow: 1,
};

export default MealChef;