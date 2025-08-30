import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import recipesData from "../data/recipe.json";
import { UserContext } from "../App";
import Navbar from "./Navbar";

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
        navigate("/login", { state: { from: location.pathname } });
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3001/api/likes/${user._id}`
        );
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

  if (loading) {
    return (
      <div style={{ color: "#fff", textAlign: "center", marginTop: "50px" }}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: "red", textAlign: "center", marginTop: "50px" }}>
        {error}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "0",
        background: "#191921",
        minHeight: "100vh",
        color: "#fff",
        position: "relative",
      }}
    >
      <Navbar />
      <div style={{ padding: "20px" }}>
        <h1 style={{ textAlign: "center", marginBottom: "30px", fontSize: "2.5rem" }}>
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
              gap: "60px",
              justifyContent: "center",
              marginTop: "30px",
            }}
          >
            {likedRecipes.map((recipe) => (
              <Link
                key={recipe.id || recipe.name}
                to={`/recipe/pantrychef/dishes/${recipe.id || recipe.name}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "220px",
                    height: "220px",
                    position: "relative",
                  }}
                >
                  {/* The main heart body (bottom half) */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "0",
                      left: "0",
                      width: "100%",
                      height: "100%",
                      background: "rgba(255, 0, 106)", // Dark pink color with transparency
                      clipPath: "polygon(0% 40%, 50% 100%, 100% 40%)",
                      border: "2px solid rgba(255, 0, 128, 1)", // Solid dark pink border
                    }}
                  ></div>

                  {/* Left heart lobe (top-left) */}
                  <div
                    style={{
                      position: "absolute",
                      top: "0",
                      left: "0",
                      width: "120px",
                      height: "120px",
                      background: "rgba(255, 0, 106)",
                      borderRadius: "50%",
                      border: "2px solid rgba(255, 0, 128, 1)",
                    }}
                  ></div>

                  {/* Right heart lobe (top-right) */}
                  <div
                    style={{
                      position: "absolute",
                      top: "0",
                      right: "0",
                      width: "120px",
                      height: "120px",
                      background: "rgba(255, 0, 106)",
                      borderRadius: "50%",
                      border: "2px solid rgba(255, 0, 128, 1)",
                    }}
                  ></div>

                  {/* The content container that sits on top of the heart shape */}
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
                      padding: "20px",
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                      zIndex: "1",
                    }}
                  >
                    <strong style={{ fontSize: "1.5rem", wordWrap: "break-word" }}>
                      {recipe.name}
                    </strong>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Liked;