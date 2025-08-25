import React, { useMemo, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import recipesData from "../data/recipe.json";

const UNSPLASH_ACCESS_KEY = "UJNKrsdX6sHSuq-0a21chG_RcNcmufGkmAJhBu5bWdI";
const EDAMAM_APP_ID = "d8fcef32";
const EDAMAM_APP_KEY = "cce36e3d448f77400622c1ec62a5b3b7";

function useIngredientImages(ingredients) {
  const [images, setImages] = useState([]);

  useEffect(() => {
    (async () => {
      const newImgs = await Promise.all(
        ingredients.map(async (ing) => {
          const q = typeof ing === "string" ? ing : ing.name;
          try {
            const unsplashResult = await axios.get(
              `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
                q
              )}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=1`
            );
            if (unsplashResult.data.results?.[0]?.urls?.small) {
              // Correctly access first result's image URL
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
            // Correct optional chaining with array indexing
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
    })();
  }, [ingredients]);

  return images;
}

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
      await axios.post("http://localhost:3001/api/ratings/rate", {
        dishId: recipe.id || recipe.name,
        rating,
      });
      setShowRating(false);
    } catch (error) {
      console.error("Failed to submit rating:", error);
      setShowRating(false);
    }
  };

  const handleCookedClick = () => {
    if (typeof onCooked === "function") {
      onCooked();
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          onClick={() => setRating(i)}
          style={{
            fontSize: 40,
            cursor: "pointer",
            color: i <= rating ? "#FFD700" : "#bbb",
            userSelect: "none",
            marginRight: 8,
          }}
          aria-label={`${i} star`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setRating(i);
              e.preventDefault();
            }
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <>
      <div
        style={{
          position: "relative",
          margin: "3rem auto",
          width: "100%",
          maxWidth: 1200,
          boxSizing: "border-box",
          padding: "0 40px",
        }}
      >
        {/* Progress Bar */}
        <div
          style={{
            height: 8,
            background: "#333",
            borderRadius: 5,
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "#4EC9E1",
              transition: "width 0.4s ease",
            }}
          />
        </div>

        {/* Step Box */}
        <div
          style={{
            background: "rgba(60,60,65,0.95)",
            padding: "3rem",
            borderRadius: 16,
            textAlign: "center",
            color: "#fff",
            boxShadow: "0 0 20px rgba(0,0,0,0.7)",
            minHeight: 300,
            fontSize: "1.6rem",
            lineHeight: 1.5,
          }}
        >
          <h3
            style={{
              margin: 0,
              marginBottom: 18,
              fontSize: "2rem",
              color: "#ffb347",
            }}
          >
            Step {active + 1}
          </h3>
          <p>{steps[active]}</p>
        </div>

        {/* Arrows */}
        <div
          className="arrow-left"
          onClick={moveLeft}
          style={{
            position: "absolute",
            top: "50%",
            left: 10,
            fontSize: 50,
            color: "#fff",
            cursor: "pointer",
            userSelect: "none",
            transform: "translateY(-50%)",
            zIndex: 10,
          }}
          tabIndex={0}
          role="button"
          aria-label="Previous step"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              moveLeft();
              e.preventDefault();
            }
          }}
        >
          &#8249;
        </div>

        <div
          className="arrow-right"
          onClick={moveRight}
          style={{
            position: "absolute",
            top: "50%",
            right: 10,
            fontSize: 50,
            color: "#fff",
            cursor: "pointer",
            userSelect: "none",
            transform: "translateY(-50%)",
            zIndex: 10,
          }}
          tabIndex={0}
          role="button"
          aria-label="Next step"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              moveRight();
              e.preventDefault();
            }
          }}
        >
          &#8250;
        </div>

        {/* Last Step Action Buttons */}
        {isLastStep && !showRating && (
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <button
              onClick={() => setShowRating(true)}
              style={{
                backgroundColor: "#4EC9E1",
                color: "#141417",
                fontWeight: "700",
                fontSize: "1.4rem",
                border: "none",
                padding: "12px 28px",
                borderRadius: 12,
                cursor: "pointer",
                boxShadow: "0 0 10px #4EC9E1",
              }}
              aria-label="Rate this dish"
            >
              Rate this Dish
            </button>
            <div style={{ marginTop: 16 }}>
              <button
                onClick={handleCookedClick}
                style={{
                  backgroundColor: "#8FE99F",
                  color: "#141417",
                  fontWeight: "700",
                  fontSize: "1.4rem",
                  border: "none",
                  padding: "12px 28px",
                  borderRadius: 12,
                  cursor: "pointer",
                  boxShadow: "0 0 10px #8FE99F",
                }}
                aria-label="Mark as cooked"
              >
                Cooked
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {showRating && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="rate-dish-title"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10000,
          }}
          onClick={() => setShowRating(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#22272b",
              padding: 32,
              borderRadius: 18,
              minWidth: 320,
              maxWidth: 400,
              textAlign: "center",
              color: "#eee",
              boxShadow: "0 0 20px #4EC9E1",
              userSelect: "none",
            }}
          >
            <h2 id="rate-dish-title" style={{ marginBottom: 24 }}>
              Rate the Dish
            </h2>
            <div>{renderStars()}</div>
            <button
              onClick={handleRatingSubmit}
              disabled={!rating}
              style={{
                marginTop: 30,
                backgroundColor: rating ? "#4EC9E1" : "#555",
                border: "none",
                padding: "10px 28px",
                borderRadius: 10,
                color: rating ? "#141417" : "#999",
                fontWeight: "700",
                fontSize: "1.2rem",
                cursor: rating ? "pointer" : "default",
                userSelect: "none",
                boxShadow: rating ? "0 0 12px #4EC9E1" : "none",
              }}
              aria-disabled={!rating}
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default function Dishes() {
  const { id } = useParams();
  const [bgImageUrl, setBgImageUrl] = useState(null);
  const mainContentRef = useRef(null);
  const navigate = useNavigate();

  const recipe = useMemo(() => {
    const all = recipesData.recipes || [];
    return (
      all.find(
        (r) =>
          (r.id && String(r.id) === String(id)) ||
          (typeof r.id === "number" && String(r.id) === String(id)) ||
          r.name === id
      ) || null
    );
  }, [id]);

  const ingredients = recipe?.ingredients || [];
  const ingredientImgs = useIngredientImages(ingredients);
  const instructions = recipe?.instructions || recipe?.steps || [];

  useEffect(() => {
    (async () => {
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
    })();
  }, [recipe]);

  const scrollToContent = () => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

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

      console.log("Cooked saved, navigating...");
      navigate("/recipe/pantrychef");
    } catch (error) {
      console.error("Error on cooked button click:", error);
    }
  };

  if (!recipe) {
    return (
      <div
        style={{
          color: "#fff",
          background: "#191921",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
        }}
      >
        Dish not found.
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `url(${bgImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
          filter: "brightness(0.65)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
        aria-hidden="true"
      >
        <div
          style={{
            backgroundColor: "rgba(50, 50, 50, 0.6)",
            padding: "24px 16px",
            textAlign: "center",
            color: "#fff",
            fontWeight: "900",
            fontSize: "2.8rem",
            fontFamily: "'Lobster', cursive",
            userSelect: "none",
          }}
        >
          Ummm LOOKS YUMMY! .. Can't Wait?
          <br />
          <button
            onClick={scrollToContent}
            style={{
              marginTop: 16,
              backgroundColor: "#4EC9E1",
              color: "#141417",
              fontWeight: "900",
              fontSize: "1.6rem",
              border: "none",
              padding: "12px 36px",
              borderRadius: 24,
              cursor: "pointer",
              boxShadow: "0 0 12px #4EC9E1",
              userSelect: "none",
            }}
            aria-label="Get started with recipe"
          >
            Get Started
          </button>
        </div>
      </div>

      <main
        ref={mainContentRef}
        style={{
          position: "relative",
          zIndex: 10,
          marginTop: "100vh",
          maxWidth: 900,
          marginLeft: "auto",
          marginRight: "auto",
          padding: "2rem 3rem 4rem",
          color: "#EEE",
          fontFamily: "'Lobster', cursive",
          minHeight: "calc(100vh - 90px)",
          overflowY: "auto",
          backgroundColor: "#191921",
        }}
      >
        <h1
          style={{
            position: "sticky",
            top: 0,
            left: 0,
            backgroundColor: "#e0e0e0",
            color: "#141417",
            fontWeight: "900",
            fontSize: "3.2rem",
            width: "100%",
            textAlign: "center",
            margin: 0,
            padding: "16px 0",
            zIndex: 100,
            fontFamily: "'Lobster', cursive",
          }}
        >
          {recipe.name}
        </h1>

        <section
          aria-label="Ingredients required"
          style={{
            backgroundColor: "rgba(24,24,28,0.6)",
            borderRadius: 18,
            padding: "2rem 1.5rem",
            marginBottom: "3rem",
            boxShadow: "0 0 12px rgba(0,0,0,0.5)",
          }}
        >
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "2rem",
              color: "#fff",
              textShadow: "0 0 5px #000",
            }}
          >
            Ingredients:
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1.5rem 2rem",
            }}
          >
            {ingredients.map((ing, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(38, 40, 46, 0.85)",
                  borderRadius: "12px",
                  padding: "0.75rem 1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  color: "#eee",
                  fontSize: "1.25rem",
                  boxShadow: "0 0 12px #0008",
                }}
              >
                {ingredientImgs[i] ? (
                  <img
                    src={ingredientImgs[i]}
                    alt={typeof ing === "string" ? ing : ing.name}
                    style={{
                      width: 50,
                      height: 50,
                      objectFit: "cover",
                      borderRadius: "50%",
                      border: "2.5px solid #444",
                      background: "#eee",
                      boxShadow: "0 0 6px #0008",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: "50%",
                      background: "#555",
                      flexShrink: 0,
                    }}
                  />
                )}
                <span>
                  {typeof ing === "string"
                    ? ing
                    : `${ing.name}${
                        ing.quantity ? ` - ${ing.quantity} ${ing.unit || ""}` : ""
                      }`}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            backgroundColor: "rgba(24,24,28,0.7)",
            borderRadius: 18,
            padding: "2rem 1.5rem",
            marginBottom: "3rem",
            boxShadow: "0 0 12px rgba(0,0,0,0.5)",
          }}
        >
          <h2 style={{ fontSize: "2rem", color: "#fff", marginBottom: "2rem" }}>
            Timings:
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1.5rem",
            }}
          >
            <div
              style={{
                background: "rgba(38, 40, 46, 0.85)",
                padding: "0.8rem 1rem",
                borderRadius: "12px",
                fontSize: "1.2rem",
                color: "#e98fff",
              }}
            >
              Prep time:{" "}
              {recipe.prep_minutes || recipe.prep_time || recipe.time || "N/A"}{" "}
              min
            </div>
            <div
              style={{
                background: "rgba(38, 40, 46, 0.85)",
                padding: "0.8rem 1rem",
                borderRadius: "12px",
                fontSize: "1.2rem",
                color: "#8fe99f",
              }}
            >
              Cook time:{" "}
              {recipe.cook_minutes || recipe.cook_time || recipe.time || "N/A"}{" "}
              min
            </div>
          </div>
        </section>

        {/* Steps Carousel */}
        <InstructionCarousel
          steps={instructions.map((step) =>
            typeof step === "string" ? step : step.instruction
          )}
          recipe={recipe}
          onCooked={handleCooked}
        />
      </main>
    </>
  );
}