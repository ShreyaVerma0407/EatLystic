import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import recipesData from "../data/recipe.json";
import { UserContext } from "../App";
import Navbar from "./Navbar";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function useIngredientImages(ingredients) {
  const [images, setImages] = useState([]);

  useEffect(() => {
    (async () => {
      const newImgs = await Promise.all(
        ingredients.map(async (ing) => {
          const q = typeof ing === "string" ? ing : ing.name;
          try {
            const res = await axios.get(
              `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
                q
              )}&client_id=UJNKrsdX6sHSuq-0a21chG_RcNcmufGkmAJhBu5bWdI&per_page=1`
            );
            if (res.data.results?.[0]?.urls?.small) {
              return res.data.results[0].urls.small;
            }
          } catch (e) {
            console.error(e);
          }
          return "";
        })
      );
      setImages(newImgs);
    })();
  }, [ingredients]);

  return images;
}

const Liked = () => {
  const { user } = useContext(UserContext);
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchLikedRecipes = async () => {
      if (!user?._id) {
        setLoading(false);
        setError("User not logged in. Redirecting to login page...");
        setTimeout(() => {
          navigate("/login", { state: { from: location.pathname } });
        }, 1500);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/likes/${user._id}`);
        const likedRecipeIds = response.data.liked;

        const foundRecipes = recipesData.recipes.filter(
          (recipe) =>
            likedRecipeIds.includes(recipe.id) ||
            likedRecipeIds.includes(recipe.name)
        );

        setLikedRecipes(foundRecipes);
      } catch (err) {
        console.error("Failed to fetch liked recipes:", err);
        setError("Failed to load liked recipes.");
      } finally {
        setLoading(false);
      }
    };

    fetchLikedRecipes();
  }, [user, navigate, location.pathname]);

  if (loading)
    return (
      <div style={{ color: "#fff", textAlign: "center", marginTop: "50px" }}>
        Loading...
      </div>
    );

  if (error)
    return (
      <div style={{ color: "red", textAlign: "center", marginTop: "50px" }}>
        {error}
      </div>
    );

  return (
    <div
      style={{
        background: "#191921",
        minHeight: "100vh",
        color: "#fff",
        position: "relative",
        paddingBottom: "4rem",
      }}
    >
      <Navbar />
      <div style={{ padding: "2rem" }}>
        <h1
          style={{
            textAlign: "center",
            marginBottom: "3rem",
            fontSize: "2.5rem",
          }}
        >
          Your Liked Recipes 💖
        </h1>

        {likedRecipes.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              fontSize: "1.2rem",
              color: "#ccc",
              marginTop: "80px",
            }}
          >
            You haven't liked any recipes yet.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "3rem",
              justifyContent: "center",
            }}
          >
            {likedRecipes.map((recipe) => {
              const ingredientImgs = useIngredientImages(recipe.ingredients || []);
              return (
                <Link
                  key={recipe.id || recipe.name}
                  to={`/recipe/pantrychef/dishes/${recipe.id || recipe.name}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div
                    style={{
                      width: "220px",
                      height: "220px",
                      position: "relative",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      cursor: "pointer",
                    }}
                    className="heart-card"
                  >
                    {/* Heart Shape */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "0",
                        left: "0",
                        width: "100%",
                        height: "100%",
                        background: "rgba(255, 0, 106, 0.9)",
                        clipPath: "polygon(0% 40%, 50% 100%, 100% 40%)",
                        border: "2px solid rgba(255, 0, 128, 1)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "0",
                        left: "0",
                        width: "120px",
                        height: "120px",
                        background: "rgba(255, 0, 106, 0.9)",
                        borderRadius: "50%",
                        border: "2px solid rgba(255, 0, 128, 1)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "0",
                        right: "0",
                        width: "120px",
                        height: "120px",
                        background: "rgba(255, 0, 106, 0.9)",
                        borderRadius: "50%",
                        border: "2px solid rgba(255, 0, 128, 1)",
                      }}
                    />

                    {/* Content */}
                    <div
                      style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        top: "0",
                        left: "0",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                        padding: "1rem",
                        zIndex: "1",
                      }}
                    >
                      {ingredientImgs[0] && (
                        <img
                          src={ingredientImgs[0]}
                          alt={recipe.ingredients?.[0]?.name || "ingredient"}
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: "50%",
                            marginBottom: "0.5rem",
                            border: "2px solid #fff",
                            objectFit: "cover",
                          }}
                        />
                      )}
                      <strong style={{ fontSize: "1.5rem" }}>{recipe.name}</strong>
                      <p style={{ fontSize: "1rem", margin: "5px 0", color: "#eee" }}>
                        Cuisine: {recipe.cuisine || "N/A"}
                      </p>
                      <p style={{ fontSize: "1rem", margin: "0", color: "#eee" }}>
                        Prep: {recipe.prep_time || recipe.prep_minutes || "N/A"} min
                      </p>
                      <p style={{ fontSize: "1rem", margin: "0", color: "#eee" }}>
                        Cook: {recipe.cook_time || recipe.cook_minutes || "N/A"} min
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Hover effect */}
      <style>{`
        .heart-card:hover {
          transform: scale(1.05);
          box-shadow: 0 0 20px rgba(255, 0, 128, 0.6);
        }
      `}</style>
    </div>
  );
};

export default Liked;
