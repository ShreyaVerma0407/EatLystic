import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar"; 
import "../styles/Liked.css";

const Liked = ({ userId }) => {
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); 
  const [images, setImages] = useState({});
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchLikedRecipes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/liked/${userId}`);
        setLikedRecipes(response.data.data);
        setLoading(false);
      } catch (err) {
        setError("Something went wrong while loading liked recipes.");
        setLoading(false);
      }
    };
    if (userId) fetchLikedRecipes();
  }, [userId]);

  const filteredRecipes = likedRecipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    likedRecipes.forEach(async (recipe) => {
      if (images[recipe.recipeId]) return;
      let imageUrl = "";

      try {
        const unsplashRes = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
            recipe.name
          )}&client_id=${import.meta.env.VITE_UNSPLASH_KEY}`
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
            )}&app_id=${import.meta.env.VITE_EDAMAM_APP_ID}&app_key=${import.meta.env.VITE_EDAMAM_APP_KEY}&from=0&to=1`
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

  const handleRecipeClick = (recipe) => {
    navigate(`/recipe/pantrychef/dishes/${recipe.recipeId}`, {
      state: { recipe, image: images[recipe.recipeId] }, 
    });
  };

  if (loading) return <div className="liked-loading">Loading liked recipes...</div>;
  if (error) return <div className="liked-error">{error}</div>;
  if (!likedRecipes || likedRecipes.length === 0) return <div className="liked-empty">No liked recipes found.</div>;

  return (
    <div className="bg-dark text-white" style={{ minHeight: "100vh" }}>
      <div style={{ position: "fixed", top: 0, width: "100%", zIndex: 1030 }}>
        <Navbar />
      </div>

      <div style={{ paddingTop: "80px" }}>
        <div className="container mt-5">
          <h1 className="text-center mb-4">My Liked Recipes</h1>
          <div className="d-flex justify-content-center mb-4">
            <input
              type="text"
              className="form-control w-50"
              placeholder="Search your liked recipes..."
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <div className="liked-recipes-list">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.recipeId}
                className="recipe-card"
                onClick={() => handleRecipeClick(recipe)}
              >
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
      </div>
    </div>
  );
};

export default Liked;