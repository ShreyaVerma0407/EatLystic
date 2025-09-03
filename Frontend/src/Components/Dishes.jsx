import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_KEY;
const EDAMAM_APP_ID = import.meta.env.VITE_EDAMAM_APP_ID;
const EDAMAM_APP_KEY = import.meta.env.VITE_EDAMAM_APP_KEY;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Dishes = () => {
  const { id } = useParams();
  const [recipesData, setRecipesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [bgImageUrl, setBgImageUrl] = useState(null);
  const [images, setImages] = useState([]);
  const navigate = useNavigate();

  // Fetch recipe data from JSON
  useEffect(() => {
    fetch("/data/recipe.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load recipes");
        return res.json();
      })
      .then((data) => {
        setRecipesData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Error loading recipe data.");
        setLoading(false);
        console.error(err);
      });
  }, []);

  // Find the recipe by id or name
  const recipe = useMemo(() => {
    if (!recipesData) return null;
    return (
      recipesData.recipes?.find(
        (r) => String(r.id) === String(id) || r.name === id
      ) || null
    );
  }, [id, recipesData]);

  // Fetch background image for recipe
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

  // Fetch images for ingredients
  useEffect(() => {
    if (!recipe?.ingredients) return;

    async function fetchIngredientImages() {
      const newImgs = await Promise.all(
        recipe.ingredients.map(async (ing) => {
          const q = typeof ing === "string" ? ing : ing.name;
          try {
            const unsplashResult = await axios.get(
              `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
                q
              )}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=1`
            );
            if (unsplashResult.data.results?.[0]?.urls?.small) {
              return unsplashResult.data.results[0].urls.small;
            }
          } catch (e) {
            console.error(e);
          }

          try {
            const edaRes = await axios.get(
              `https://api.edamam.com/api/food-database/v2/parser?ingr=${encodeURIComponent(
                q
              )}&app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}`
            );
            if (edaRes.data.hints?.[0]?.food?.image) {
              return edaRes.data.hints[0].food.image;
            }
          } catch (e) {
            console.error(e);
          }
          return "";
        })
      );
      setImages(newImgs);
    }

    fetchIngredientImages();
  }, [recipe]);

  const handleCooked = async () => {
    if (!recipe) return;
    try {
      const data = {
        name: recipe.name,
        nutritionalContent: recipe.nutrition || {},
        ingredients: recipe.ingredients || [],
      };

      await axios.post(`${API_BASE_URL}/recipes/cooked`, data);
      await axios.post(`${API_BASE_URL}/pantry/reduce`, {
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
      {/* Background Image */}
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

      {/* Main Content */}
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

        {/* Ingredients */}
        <section aria-label="Ingredients">
          <h2>Ingredients</h2>
          <ul>
            {(recipe.ingredients || []).map((ing, i) => (
              <li key={i} style={{ marginBottom: 10 }}>
                {typeof ing === "string"
                  ? ing
                  : `${ing.name}${
                      ing.quantity ? ` - ${ing.quantity} ${ing.unit || ""}` : ""
                    }`}
                {/* Ingredient Image */}
                {images[i] && (
                  <img
                    src={images[i]}
                    alt={typeof ing === "string" ? ing : ing.name}
                    style={{ width: 60, height: 60, objectFit: "cover", marginLeft: 10, borderRadius: 6 }}
                  />
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Preparation Steps */}
        <section aria-label="Preparation Steps">
          <h2>Preparation Steps</h2>
          <InstructionCarousel steps={recipe.steps || []} recipe={recipe} onCooked={handleCooked} />
        </section>

        {/* Cooked Button */}
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

// Instruction Carousel Component
const InstructionCarousel = ({ steps, recipe, onCooked }) => {
  const [active, setActive] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const navigate = useNavigate();

  const moveLeft = () =>
    setActive(active === 0 ? steps.length - 1 : active - 1);
  const moveRight = () =>
    setActive(active === steps.length - 1 ? 0 : active + 1);

  const isLastStep = active === steps.length - 1;

  const progress = ((active + 1) / steps.length) * 100;

  const handleRatingSubmit = async () => {
    if (rating === 0) return;
    try {
      await axios.post(`${API_BASE_URL}/ratings/rate`, {
        dishId: recipe.id || recipe.name,
        rating,
      });
      setShowRating(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {steps.length > 0 ? (
        <>
          <p style={{ fontSize: "1.2rem" }}>{steps[active]}</p>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
            <button onClick={moveLeft}>Prev</button>
            <button onClick={moveRight}>Next</button>
          </div>
          <div style={{ marginTop: 10 }}>
            <progress value={active + 1} max={steps.length} />
          </div>
          {isLastStep && (
            <div style={{ marginTop: 10 }}>
              {!showRating ? (
                <button onClick={() => setShowRating(true)}>Rate Recipe</button>
              ) : (
                <div>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                  />
                  <button onClick={handleRatingSubmit}>Submit</button>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <p>No steps available</p>
      )}
    </div>
  );
};

export default Dishes;
