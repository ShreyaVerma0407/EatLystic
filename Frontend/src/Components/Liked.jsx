import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Liked.css";

const Liked = ({ userId }) => {
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // For filtering recipes
  const [images, setImages] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLikedRecipes = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/liked/${userId}`);
        setLikedRecipes(response.data.data);
        setLoading(false);
      } catch (err) {
        setError("Something went wrong while loading liked recipes.");
        setLoading(false);
      }
    };
    if (userId) fetchLikedRecipes();
  }, [userId]);

  // Filter the recipes based on search term
  const filteredRecipes = likedRecipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch recipe images
  useEffect(() => {
    likedRecipes.forEach(async (recipe) => {
      if (images[recipe.recipeId]) return;

      let imageUrl = "";

      try {
        const unsplashRes = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(recipe.name)}&client_id=${process.env.VITE_UNSPLASH_KEY}`
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
            `https://api.edamam.com/search?q=${encodeURIComponent(recipe.name)}&app_id=${process.env.VITE_EDAMAM_APP_ID}&app_key=${process.env.VITE_EDAMAM_APP_KEY}&from=0&to=1`
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
  }, [likedRecipes]);

  // Handle recipe click to navigate to the recipe detail page
  const handleRecipeClick = (recipe) => {
    navigate(`/recipe/pantrychef/dishes/${recipe.recipeId}`, {
      state: { recipe, image: images[recipe.recipeId] }, // Passing recipe and image
    });
  };

  if (loading) return <div className="liked-loading">Loading liked recipes...</div>;
  if (error) return <div className="liked-error">{error}</div>;
  if (!likedRecipes || likedRecipes.length === 0) return <div className="liked-empty">No liked recipes found.</div>;

  return (
    <div className="liked-container">
      {/* Header */}
      <div className="liked-header">
        <div className="profile-avatar">👤</div>
        <div>
          <h1>
            <span className="orange-heart">♥</span> My Liked Recipes
          </h1>
          <p className="subtitle">
            {likedRecipes.length} delicious recipes liked!
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="search-and-tabs">
        <input
          type="text"
          className="search-bar"
          placeholder="Search your liked recipes..."
          value={searchTerm} // Bind the input value to searchTerm state
          onChange={(e) => setSearchTerm(e.target.value)} // Update the searchTerm state on input change
        />
      </div>

      {/* Recipe Cards */}
      <div className="liked-recipes-list">
        {filteredRecipes.map((recipe) => (
          <div key={recipe.recipeId} className="recipe-card" onClick={() => handleRecipeClick(recipe)}>
            <div className="img-container">
              <img src={images[recipe.recipeId] || recipe.image} alt={recipe.name} />
              <span className="fav-heart">♥</span>
              <span className={`type-badge type-${recipe.type ? recipe.type.toLowerCase() : ""}`}>
                {recipe.type}
              </span>
            </div>
            <div className="card-content">
              <h3>{recipe.name}</h3>
              <div className="meta-row">
                <span className="meta-item">⏱ {recipe.prep_time}</span>
              </div>
              <button className="view-btn">View Recipe</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Liked;
