import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const UNSPLASH_ACCESS_KEY = "UJNKrsdX6sHSuq-0a21chG_RcNcmufGkmAJhBu5bWdI";
const EDAMAM_APP_ID = "d8fcef32";
const EDAMAM_APP_KEY = "cce36e3d448f77400622c1ec62a5b3b7";

const Dishes = () => {
  const { id } = useParams();
  const [recipesData, setRecipesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [bgImageUrl, setBgImageUrl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/data/recipe.json")
      .then(res => {
        if (!res.ok) throw new Error("Failed to load recipes");
        return res.json();
      })
      .then(data => {
        setRecipesData(data);
        setLoading(false);
      })
      .catch(err => {
        setError("Error loading recipe data.");
        setLoading(false);
        console.error(err);
      });
  }, []);

  const recipe = useMemo(() => {
    if (!recipesData) return null;
    return recipesData.recipes?.find(r => String(r.id) === String(id) || r.name === id) || null;
  }, [id, recipesData]);

  useEffect(() => {
    async function fetchBgImage() {
      if (!recipe?.name) return;
      try {
        const res = await axios.get(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
            recipe.name
          )}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=1`
        );
        if (res.data.results?.[0]?.urls?.regular) {
          setBgImageUrl(res.data.results[0].urls.regular);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchBgImage();
  }, [recipe]);

  const handleCooked = async () => {
    if (!recipe) return;
    try {
      const data = {
        name: recipe.name,
        nutritionalContent: recipe.nutrition || {},
        ingredients: recipe.ingredients || [],
      };

      await axios.post("http://localhost:3001/api/recipes/cooked", data);

      await axios.post("http://localhost:3001/api/pantry/reduce", {
        ingredients: recipe.ingredients,
      });

      navigate("/recipe/pantrychef");
    } catch (error) {
      console.error("Error on cooked button click:", error);
    }
  };

  if (loading) return <p>Loading recipe...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!recipe) return <p>Recipe not found.</p>;

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `url(${bgImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.65)",
          zIndex: 0,
        }}
        aria-hidden="true"
      />
      <main
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 900,
          margin: "100vh auto 0",
          padding: "2rem 3rem 4rem",
          color: "#EEE",
          backgroundColor: "#191921",
          fontFamily: "'Lobster', cursive",
        }}
      >
        <h1
          style={{
            position: "sticky",
            top: 0,
            backgroundColor: "#e0e0e0",
            color: "#141417",
            fontWeight: "900",
            fontSize: "3.2rem",
            padding: "16px 0",
            textAlign: "center",
            margin: 0,
            fontFamily: "'Lobster', cursive",
            zIndex: 10,
          }}
        >
          {recipe.name}
        </h1>

        <section aria-label="Ingredients">
          <h2>Ingredients</h2>
          <ul>
            {(recipe.ingredients || []).map((ing, i) => (
              <li key={i}>
                {typeof ing === "string" ? ing : `${ing.name}${ing.quantity ? ` - ${ing.quantity} ${ing.unit || ""}` : ""}`}
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Preparation Steps">
          <h2>Preparation Steps</h2>
          <ol>
            {(recipe.steps || []).map((step, i) => (
              <li key={i}>{typeof step === "string" ? step : step.instruction}</li>
            ))}
          </ol>
        </section>

        <button
          onClick={handleCooked}
          style={{
            marginTop: 32,
            padding: "15px 48px",
            background: "#FFA500",
            color: "#fff",
            border: "none",
            borderRadius: 22,
            fontWeight: 800,
            fontSize: 19,
            cursor: "pointer",
            boxShadow: "0 2px 8px 0 #0002",
            letterSpacing: "0.5px",
          }}
        >
          Cooked
        </button>
      </main>
    </>
  );
};

export default Dishes;