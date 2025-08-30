import React, { useState, useEffect, useMemo } from "react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import recipesData from "../data/recipe.json";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";

const CUISINE_OPTIONS = ["All", "Asian", "Middle Eastern", "European", "American", "African"];
const PREP_TIME_OPTIONS = [
  { label: "Any", min: 0, max: Infinity },
  { label: "< 10 min", min: 0, max: 10 },
  { label: "< 20 min", min: 0, max: 20 },
  { label: "< 30 min", min: 0, max: 30 },
  { label: ">= 30 min", min: 30, max: Infinity }
];
const COOK_TIME_OPTIONS = [...PREP_TIME_OPTIONS];

const cardMainColor = "#33353e";
const cardTextColor = "#fff";
const borderColor = "#23242a";
const orange = "#ff0166ff";

const modalBackgroundStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: "#181824",
  borderRadius: 32,
  width: "90%",
  maxWidth: 640,
  maxHeight: "80vh",
  overflowY: "auto",
  padding: "2.5rem 2.3rem 2.7rem 2.3rem",
  position: "relative",
  color: "#fff",
  boxShadow: "0 2px 18px 0 #0007",
  animation: "fadeIn 0.44s",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif"
};

const closeButtonStyle = {
  position: "absolute",
  top: 12,
  right: 12,
  background: "transparent",
  border: "none",
  color: "#fff",
  fontSize: 30,
  cursor: "pointer",
  lineHeight: 1,
};

const downloadButtonStyle = {
  position: "absolute",
  top: 12,
  left: 12,
  backgroundColor: orange,
  border: "none",
  borderRadius: 6,
  color: "#fff",
  padding: "6px 12px",
  cursor: "pointer",
  fontWeight: "bold",
  zIndex: 1010,
};

const cookedButtonStyle = {
  position: "fixed",
  bottom: 24,
  right: 24,
  backgroundColor: orange,
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "12px 20px",
  fontSize: 16,
  fontWeight: "bold",
  cursor: "pointer",
  zIndex: 1100,
  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
};

const filterContainerStyle = {
  marginBottom: "2rem",
  display: "flex",
  gap: "1rem",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
};

const parseTime = (time) => {
  if (!time) return 0;
  if (typeof time === "number") return time;
  if (typeof time === "string") {
    const num = parseInt(time);
    return isNaN(num) ? 0 : num;
  }
  return 0;
};

const PantryChef = ({ currentUserId }) => {
  const [pantryItems, setPantryItems] = useState([]);
  const [matchingRecipes, setMatchingRecipes] = useState([]);
  const [openRecipeId, setOpenRecipeId] = useState(null);
  const [likedRecipes, setLikedRecipes] = useState(() => new Set());

  const [cuisineFilter, setCuisineFilter] = useState("All");
  const [prepFilter, setPrepFilter] = useState(PREP_TIME_OPTIONS[0]);
  const [cookFilter, setCookFilter] = useState(COOK_TIME_OPTIONS);
  const [keywordsFilter, setKeywordsFilter] = useState("");
  const [showLikedOnly, setShowLikedOnly] = useState(false);

  const navigate = useNavigate();

  const recipesArray = useMemo(() => {
    if (!Array.isArray(recipesData?.recipes)) return [];
    return recipesData.recipes.map((r, i) => ({
      ...r,
      id: (r.id ?? i).toString(),
    }));
  }, [recipesData]);

  useEffect(() => {
    if (!currentUserId) return;
    fetch(`http://localhost:3001/api/pantry/${currentUserId}`)
      .then(res => res.json())
      .then(result => setPantryItems(Array.isArray(result?.data) ? result.data : []))
      .catch(() => setPantryItems([]));
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;
    fetch(`http://localhost:3001/api/likes/${currentUserId}`)
      .then(res => res.json())
      .then(result => {
        if (Array.isArray(result.liked)) {
          setLikedRecipes(new Set(result.liked));
        }
      })
      .catch(err => console.error("Failed to fetch liked recipes:", err));
  }, [currentUserId]);

  useEffect(() => {
    if (!Array.isArray(pantryItems) || pantryItems.length === 0) {
      setMatchingRecipes([]);
      return;
    }
    const pantryNames = pantryItems.map(i => String(i.name || "").toLowerCase());

    const matched = recipesArray.filter(recipe => {
      const recipeIngredients = (recipe.ingredients || []).map(ing =>
        typeof ing === "string" ? ing.toLowerCase() : ing.name ? ing.name.toLowerCase() : ""
      );

      const matchCount = pantryNames.filter(pantryItem =>
        recipeIngredients.some(recipeIng => recipeIng.includes(pantryItem))
      ).length;

      return matchCount >= 3;
    });

    setMatchingRecipes(matched);
  }, [pantryItems, recipesArray]);

  const filteredRecipes = useMemo(() => {
    if (!Array.isArray(matchingRecipes) || matchingRecipes.length === 0) return [];
    const keywordsArray = keywordsFilter
      .toLowerCase()
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    return matchingRecipes.filter(recipe => {
      if (showLikedOnly && !likedRecipes.has(recipe.id)) return false;
      if (cuisineFilter !== "All" && (recipe.cuisine || "").toLowerCase() !== cuisineFilter.toLowerCase())
        return false;

      const prepMinutes = parseTime(recipe.prep_minutes ?? recipe.prep_time ?? recipe.time);
      const cookMinutes = parseTime(recipe.cook_minutes ?? recipe.cook_time ?? recipe.time);

      if (prepMinutes < prepFilter.min || prepMinutes > prepFilter.max) return false;
      if (cookMinutes < cookFilter.min || cookMinutes > cookFilter.max) return false;

      if (keywordsArray.length > 0) {
        const recipeKeywords = (recipe.keywords || []).map(k => k.toLowerCase());
        if (!keywordsArray.some(k => recipeKeywords.includes(k))) return false;
      }

      return true;
    });
  }, [matchingRecipes, likedRecipes, cuisineFilter, prepFilter, cookFilter, keywordsFilter, showLikedOnly]);

  const openRecipe = openRecipeId ? filteredRecipes.find(r => r.id === openRecipeId) : null;

  const toggleLike = async (recipeId, e) => {
    e.stopPropagation();

    const isLiked = likedRecipes.has(recipeId);
    try {
      if (isLiked) {
        await fetch("http://localhost:3001/api/likes", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUserId, recipeId }),
        });
      } else {
        await fetch("http://localhost:3001/api/likes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUserId, recipeId }),
        });
      }

      setLikedRecipes(prev => {
        const updated = new Set(prev);
        if (isLiked) updated.delete(recipeId);
        else updated.add(recipeId);
        return updated;
      });
    } catch (err) {
      console.error("Failed to update like:", err);
    }
  };

  const handleRecipeClick = id => setOpenRecipeId(id);
  const handleCloseModal = () => setOpenRecipeId(null);

  const downloadPDF = async (recipe) => {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text(recipe.name, 14, 22);

    if (recipe.image) {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = "/" + recipe.image;
        await new Promise(resolve => {
          img.onload = resolve;
          img.onerror = () => resolve();
        });

        const imgWidth = 180;
        const aspectRatio = img.height / img.width;
        const imgHeight = imgWidth * aspectRatio;
        doc.addImage(img, "JPEG", 14, 30, imgWidth, imgHeight);
      } catch {}
    }

    let yPosition = recipe.image ? 220 : 40;
    yPosition += 10;

    const lineHeight = 10;
    doc.setFontSize(14);
    doc.setTextColor("#333");

    doc.text(`Cuisine: ${recipe.cuisine || "N/A"}`, 14, yPosition);
    yPosition += lineHeight;
    doc.text(`Category: ${recipe.category || "N/A"}`, 14, yPosition);
    yPosition += lineHeight;
    doc.text(`Servings: ${recipe.servings || "N/A"}`, 14, yPosition);
    yPosition += lineHeight;
    doc.text(`Preparation Time: ${parseTime(recipe.prep_minutes ?? recipe.prep_time ?? recipe.time)} min`, 14, yPosition);
    yPosition += lineHeight;
    doc.text(`Cooking Time: ${parseTime(recipe.cook_minutes ?? recipe.cook_time ?? recipe.time)} min`, 14, yPosition);
    yPosition += lineHeight;

    if (recipe.ingredients?.length) {
      doc.text("Ingredients:", 14, yPosition);
      yPosition += lineHeight;
      recipe.ingredients.forEach(ing => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        const ingText = typeof ing === "string" ? ing : `${ing.name}${ing.quantity ? ` - ${ing.quantity} ${ing.unit || ""}` : ""}`;
        doc.text(`- ${ingText}`, 20, yPosition);
        yPosition += 8;
      });
    }

    yPosition += 10;

    if (recipe.instructions?.length || recipe.steps?.length) {
      doc.text("Instructions:", 14, yPosition);
      yPosition += lineHeight;
      const steps = recipe.instructions || recipe.steps;
      steps.forEach((step, i) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        const stepText = typeof step === "string" ? step : step.instruction || step;
        doc.text(`${i + 1}. ${stepText}`, 20, yPosition);
        yPosition += 8;
      });
    }

    doc.save(`${recipe.name || "recipe"}.pdf`);
  };

  // New handler for Cooked button click
  const handleCookedClick = async () => {
    if (!openRecipe || !currentUserId) return;

    try {
      // Step 1: Save cooked recipe data to backend
      // Assuming recipe.nutrition is the nutritional content object or string, adjust as needed
      await fetch("http://localhost:3001/api/cooked", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          recipeId: openRecipe.id,
          name: openRecipe.name,
          nutrition: openRecipe.nutrition || null,
        }),
      });

      // Step 2: Update pantry items by reducing quantity for matching items in the recipe
      const currentPantryLowerMap = new Map(
        pantryItems.map(item => [item.name.toLowerCase(), item])
      );

      for (const ing of openRecipe.ingredients || []) {
        let ingName = "";
        if (typeof ing === "string") {
          ingName = ing.toLowerCase();
        } else if (ing.name) {
          ingName = ing.name.toLowerCase();
        }
        if (!ingName) continue;

        // Find pantry item containing this ingredient name substring
        const pantryItem = pantryItems.find(pItem =>
          pItem.name.toLowerCase().includes(ingName)
        );

        if (pantryItem && pantryItem.quantity > 0) {
          // Reduce pantry quantity by 1 in backend
          await fetch("http://localhost:3001/api/pantry/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: currentUserId,
              itemName: pantryItem.name,
              change: -1,
            }),
          });
        }
      }

      // After update, refresh pantry data and matching recipes
      const refreshedPantryResponse = await fetch(`http://localhost:3001/api/pantry/${currentUserId}`);
      const refreshedPantryData = await refreshedPantryResponse.json();
      setPantryItems(Array.isArray(refreshedPantryData?.data) ? refreshedPantryData.data : []);

      alert(`Marked "${openRecipe.name}" as cooked and updated pantry items.`);
    } catch (err) {
      console.error("Failed to mark as cooked:", err);
      alert("Failed to mark this dish as cooked. Please try again.");
    }
  };

  return (
    <div style={{ padding: "2.5rem 0", maxWidth: 820, margin: "auto" }}>
      {/* Back button */}
      <button
        onClick={() => navigate("/recipe")}
        style={{
          marginBottom: "1rem",
          padding: "8px 16px",
          backgroundColor: orange,
          border: "none",
          color: "#fff",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: "700",
          fontSize: "1rem",
        }}
        aria-label="Go back to recipe"
      >
        &larr; Back
      </button>

      <h2
        style={{
          marginBottom: "2rem",
          fontWeight: 900,
          textAlign: "left",
          background: "linear-gradient(90deg, #000000, #888888)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          userSelect: "none",
        }}
      >
        PantryChef
      </h2>

      {/* Filters Section */}
      <div style={filterContainerStyle}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={showLikedOnly}
            onChange={e => setShowLikedOnly(e.target.checked)}
          />
          Show Liked Only
        </label>

        <select
          value={cuisineFilter}
          onChange={e => setCuisineFilter(e.target.value)}
          aria-label="Filter by Cuisine"
          style={{ padding: "6px 8px", borderRadius: 4 }}
        >
          {CUISINE_OPTIONS.map(opt => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        <select
          value={cookFilter.label}
          onChange={e => setCookFilter(COOK_TIME_OPTIONS.find(o => o.label === e.target.value))}
          aria-label="Filter by Cooking Time"
          style={{ padding: "6px 8px", borderRadius: 4 }}
        >
          {COOK_TIME_OPTIONS.map(opt => (
            <option key={opt.label} value={opt.label}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={prepFilter.label}
          onChange={e => setPrepFilter(PREP_TIME_OPTIONS.find(o => o.label === e.target.value))}
          aria-label="Filter by Preparation Time"
          style={{ padding: "6px 8px", borderRadius: 4 }}
        >
          {PREP_TIME_OPTIONS.map(opt => (
            <option key={opt.label} value={opt.label}>
              {opt.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Filter keywords (comma separated)"
          value={keywordsFilter}
          onChange={e => setKeywordsFilter(e.target.value)}
          aria-label="Filter by Keywords"
          style={{ padding: "6px 8px", borderRadius: 4, minWidth: 180 }}
        />
      </div>

      {/* Recipes List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        {filteredRecipes.length === 0 && <p>No matching recipes found.</p>}

        {filteredRecipes.map((recipe, idx) => {
          const imgLeft = idx % 2 === 0;
          const isLiked = likedRecipes.has(recipe.id);
          return (
            <div
              key={recipe.id}
              onClick={() => handleRecipeClick(recipe.id)}
              style={{
                display: "flex",
                flexDirection: imgLeft ? "row" : "row-reverse",
                alignItems: "center",
                background: cardMainColor,
                color: cardTextColor,
                borderRadius: "2rem",
                position: "relative",
                cursor: "pointer",
                minHeight: 180,
                width: "99%",
                maxWidth: 580,
                margin: "0 auto",
                boxShadow: "0 4px 22px 0 rgb(0 0 0 / 0.30)",
                transition: "box-shadow 0.2s"
              }}
            >
              {/* Image */}
              <div
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: `7px solid ${borderColor}`,
                  marginLeft: imgLeft ? -45 : 24,
                  marginRight: imgLeft ? 32 : -45,
                  boxShadow: "0 4px 24px 0 rgba(0,0,0,0.28)",
                  background: "#fff",
                  flexShrink: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <img
                  src={"/" + recipe.image}
                  alt={recipe.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              {/* Recipe Info */}
              <div
                style={{
                  flex: 1,
                  margin: "0 18px",
                  minHeight: 150,
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <h3 style={{ margin: "0 0 16px 0", fontWeight: 700, fontSize: 26, lineHeight: 1.15 }}>
                  {recipe.name}
                </h3>

                <div style={{ fontSize: 17, color: "#aaa", marginBottom: 8 }}>
                  <span style={{ marginRight: 16 }}>
                    <span role="img" aria-label="prep">⏱</span> Prep: {parseTime(recipe.prep_minutes ?? recipe.prep_time ?? recipe.time)} min
                  </span>
                  <span>
                    <span role="img" aria-label="cooking">🥘</span> Cook: {parseTime(recipe.cook_minutes ?? recipe.cook_time ?? recipe.time)} min
                  </span>
                </div>

                <div
                  onClick={e => toggleLike(recipe.id, e)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontWeight: "700",
                    color: isLiked ? orange : cardTextColor,
                    fontSize: 18,
                    cursor: "pointer",
                    alignSelf: imgLeft ? "flex-start" : "flex-end",
                    userSelect: "none",
                    paddingTop: 6,
                  }}
                  aria-label={isLiked ? "Unlike recipe" : "Like recipe"}
                  role="button"
                  tabIndex={0}
                  onKeyPress={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleLike(recipe.id, e);
                    }
                  }}
                >
                  <span>{isLiked ? "Liked" : "Like"} :</span>
                  {isLiked ? <AiFillHeart size={22} /> : <AiOutlineHeart size={22} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for recipe details */}
      {openRecipe && (
        <div style={modalBackgroundStyle} onClick={handleCloseModal}>

          <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
            <button aria-label="Close" onClick={handleCloseModal} style={closeButtonStyle}>×</button>

            <button
              style={downloadButtonStyle}
              onClick={() => downloadPDF(openRecipe)}
              aria-label="Download recipe PDF"
            >
              Download PDF
            </button>

            <h2 style={{ marginTop: 0, fontWeight: 700, fontSize: 28 }}>{openRecipe.name}</h2>
            {openRecipe.image && (
              <img src={"/" + openRecipe.image} alt={openRecipe.name} style={{
                width: "100%",
                borderRadius: 20,
                marginBottom: 20,
                objectFit: "cover",
                maxHeight: 300
              }} />
            )}
            <p><b>Cuisine:</b> {openRecipe.cuisine}</p>
            <p><b>Category:</b> {openRecipe.category}</p>
            <p><b>Servings:</b> {openRecipe.servings}</p>
            <p><b>Preparation Time:</b> {parseTime(openRecipe.prep_minutes ?? openRecipe.prep_time ?? openRecipe.time)} min</p>
            <p><b>Cooking Time:</b> {parseTime(openRecipe.cook_minutes ?? openRecipe.cook_time ?? openRecipe.time)} min</p>

            <p><b>Ingredients:</b></p>
            <ul>
              {(openRecipe.ingredients || []).map((ing, i) => (
                <li key={i}>{typeof ing === "string" ? ing : `${ing.name}${ing.quantity ? ` - ${ing.quantity} ${ing.unit || ""}` : ""}`}</li>
              ))}
            </ul>

            <p><b>Instructions:</b></p>
            <ol>
              {(openRecipe.instructions || openRecipe.steps || []).map((step, i) => {
                const text = typeof step === "string" ? step : step.instruction || step;
                return <li key={i}>{text}</li>;
              })}
            </ol>

            {openRecipe.tips && (
              <>
                <p><b>Tips:</b></p>
                <ul>{openRecipe.tips.map((tip, i) => <li key={i}>{tip}</li>)}</ul>
              </>
            )}

            {/* New "Get Started" Button */}
            <button
              onClick={() => navigate(`/recipe/pantrychef/dishes/${openRecipe.id}`)}
              style={{
                marginTop: "20px",
                width: "100%",
                padding: "12px 0",
                backgroundColor: orange,
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                textAlign: "center"
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* If on dish details page (simulate as if openRecipeId present and user on that route), show Cooked button fixed at bottom right */}
      {openRecipeId && (
        <button
          onClick={handleCookedClick}
          style={cookedButtonStyle}
          aria-label="Mark recipe as cooked"
        >
          Cooked
        </button>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0 }
          to { opacity: 1 }
        }
      `}</style>
    </div>
  );
};

export default PantryChef;
