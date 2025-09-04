import React, { useState, useEffect } from "react";
import axios from "axios";

const Liked = ({ userId }) => {
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch liked recipes from the API
    const fetchLikedRecipes = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/liked/${userId}`);
        console.log("Liked Recipes Response: ", response.data); // Check API response
        setLikedRecipes(response.data.data);
        setLoading(false);
      } catch (err) {
        setError("Error fetching liked recipes.");
        setLoading(false);
      }
    };

    if (userId) {
      fetchLikedRecipes();
    }
  }, [userId]);

  // Handle loading, error, and empty liked recipes
  if (loading) {
    return <div>Loading liked recipes...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!likedRecipes || likedRecipes.length === 0) {
    return <div>No liked recipes found.</div>;
  }

  return (
    <div>
      <h2>Your Liked Recipes</h2>
      <div className="liked-recipes-list">
        {likedRecipes.map((recipe) => (
          <div key={recipe.recipeId} className="recipe-card">
            <img src={recipe.image} alt={recipe.name} />
            <h3>{recipe.name}</h3>
            <p>Type: {recipe.type}</p>
            <p>Prep Time: {recipe.prep_time}</p>
            <ul>
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Liked;
