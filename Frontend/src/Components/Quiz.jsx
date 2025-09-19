import React, { useState, useEffect } from "react";
import axios from "axios";

const CookedRecipes = () => {
  const [cookedRecipes, setCookedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch cooked recipes from backend
  useEffect(() => {
    const fetchCookedRecipes = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/recipes/cooked");
        if (response.status === 200) {
          setCookedRecipes(response.data.data); // Store recipes in state
          setLoading(false);
        } else {
          setError("Failed to fetch data from server.");
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching cooked recipes:", err);
        setError("Error fetching cooked recipes.");
        setLoading(false);
      }
    };

    fetchCookedRecipes();
  }, []); // Empty dependency array means this effect runs once when the component mounts

  if (loading) {
    return <div>Loading cooked recipes...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (cookedRecipes.length === 0) {
    return <div>No cooked recipes found.</div>;
  }

  return (
    <div className="cooked-recipes-container">
      <h2>Cooked Recipes</h2>
      <div className="cooked-recipes-list">
        {cookedRecipes.map((recipe) => (
          <div key={recipe._id} className="recipe-card">
            <h3>{recipe.name}</h3>
            <p><strong>Ingredients:</strong></p>
            <ul>
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
            <p><strong>Nutritional Content:</strong></p>
            <ul>
              <li>Calories: {recipe.nutritionalContent?.calories ?? "N/A"} kcal</li>
              <li>Protein: {recipe.nutritionalContent?.protein_g ?? "N/A"} g</li>
              <li>Carbohydrates: {recipe.nutritionalContent?.carbohydrates_g ?? "N/A"} g</li>
              <li>Fat: {recipe.nutritionalContent?.fat_g ?? "N/A"} g</li>
              <li>Fiber: {recipe.nutritionalContent?.fiber_g ?? "N/A"} g</li>
            </ul>
            <p><strong>Cooked At:</strong> {new Date(recipe.cookedAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CookedRecipes;
