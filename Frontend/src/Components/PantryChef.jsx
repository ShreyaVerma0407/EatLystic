<<<<<<< HEAD
import React, { useState, useEffect } from "react";
const PantryChef = ({ currentUserId }) => {
  const [pantryItems, setPantryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!currentUserId) {
      setPantryItems([]);
      setError("No user ID provided.");
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`http://localhost:3001/api/pantry/${currentUserId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch pantry items. Status: ${res.status}`);
        }
        return res.json();
      })
      .then((result) => {
        if (result.status === "success" && Array.isArray(result.data)) {
          setPantryItems(result.data);
          if (result.data.length === 0) {
            setError("No pantry items found. Please add some ingredients.");
          }
        } else {
          setPantryItems([]);
          setError("Error: Unexpected API response format.");
        }
      })
      .catch((err) => {
        console.error("Error fetching pantry items:", err);
        setPantryItems([]);
        setError("Failed to load pantry items.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentUserId]);
  return (
    <div
      style={{
        maxWidth: 600,
        margin: "2rem auto",
        padding: "1.5rem",
        backgroundColor: "#181824",
        color: "#fff",
        borderRadius: 12,
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center" }}>My Pantry Items</h2>
      {loading && <p style={{ textAlign: "center" }}>Loading pantry items...</p>}
      {!loading && error && (
        <p style={{ color: "#ff6868", textAlign: "center" }}>{error}</p>
      )}
      {!loading && !error && pantryItems.length > 0 && (
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {pantryItems.map((item) => (
            <li
              key={item._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                backgroundColor: "#33353e",
                margin: "0.5rem 0",
                padding: "12px 20px",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                fontSize: "1.1rem",
              }}
            >
              <span>{item.name}</span>
              <span>
                {item.quantity} {item.unit || ""}
              </span>
            </li>
          ))}
        </ul>
      )}
      {!loading && !error && pantryItems.length === 0 && (
        <p style={{ textAlign: "center" }}>
          Your pantry is empty. Start adding ingredients!
        </p>
      )}
    </div>
  );
=======
import React, { useState, useEffect, useMemo } from "react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import recipesData from "../data/recipe.json";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";

const CUISINE_OPTIONS = ["All", "Asian", "Middle Eastern", "European", "American", "African"];
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";
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
  const [cookFilter, setCookFilter] = useState(COOK_TIME_OPTIONS[0]);
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
    fetch(`${API_BASE}/pantry/${currentUserId}`)
      .then(res => res.json())
      .then(result => setPantryItems(Array.isArray(result?.data) ? result.data : []))
      .catch(() => setPantryItems([]));
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;
    fetch(`${API_BASE}/likes/${currentUserId}`)
      .then(res => res.json())
      .then(result => {
        if (Array.isArray(result?.liked)) setLikedRecipes(new Set(result.liked));
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
    const keywordsArray = keywordsFilter.toLowerCase().split(",").map(s => s.trim()).filter(Boolean);
    return matchingRecipes.filter(recipe => {
      if (showLikedOnly && !likedRecipes.has(recipe.id)) return false;
      if (cuisineFilter !== "All" && (recipe.cuisine || "").toLowerCase() !== cuisineFilter.toLowerCase()) return false;

      const prepMinutes = parseTime(recipe.prep_minutes ?? recipe.prep_time ?? recipe.time);
      const cookMinutes = parseTime(recipe.cook_minutes ?? recipe.cook_time ?? recipe.time);

      if (prepMinutes < prepFilter.min || prepMinutes > prepFilter.max) return false;
      if (cookMinutes < cookFilter.min || cookMinutes > cookFilter.max) return false;

      if (keywordsArray.length) {
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
      await fetch(`${API_BASE}/likes`, {
        method: isLiked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, recipeId }),
      });
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

  const handleCookedClick = async () => {
    if (!openRecipe || !currentUserId) return;
    try {
      await fetch(`${API_BASE}/cooked`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, recipeId: openRecipe.id, name: openRecipe.name, nutrition: openRecipe.nutrition || null }),
      });

      // Update pantry in parallel
      const pantryUpdates = (openRecipe.ingredients || []).map(async ing => {
        const ingName = typeof ing === "string" ? ing.toLowerCase() : ing.name?.toLowerCase();
        if (!ingName) return;
        const pantryItem = pantryItems.find(p => p.name.toLowerCase().includes(ingName));
        if (pantryItem && pantryItem.quantity > 0) {
          await fetch(`${API_BASE}/pantry/update`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: currentUserId, itemName: pantryItem.name, change: -1 }),
          });
        }
      });
      await Promise.all(pantryUpdates);

      // Refresh pantry
      const refreshed = await fetch(`${API_BASE}/pantry/${currentUserId}`);
      const refreshedData = await refreshed.json();
      setPantryItems(Array.isArray(refreshedData?.data) ? refreshedData.data : []);

      alert(`Marked "${openRecipe.name}" as cooked and updated pantry.`);
    } catch (err) {
      console.error(err);
      alert("Failed to mark this dish as cooked.");
    }
  };

  const downloadPDF = async (recipe) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(recipe.name, 10, 20);
    doc.setFontSize(12);
    doc.text(`Cuisine: ${recipe.cuisine}`, 10, 30);
    doc.text(`Category: ${recipe.category}`, 10, 36);
    doc.text(`Servings: ${recipe.servings}`, 10, 42);
    doc.text(`Prep Time: ${parseTime(recipe.prep_minutes ?? recipe.prep_time ?? recipe.time)} min`, 10, 48);
    doc.text(`Cook Time: ${parseTime(recipe.cook_minutes ?? recipe.cook_time ?? recipe.time)} min`, 10, 54);
    doc.text("Ingredients:", 10, 64);
    (recipe.ingredients || []).forEach((ing, idx) => {
      const text = typeof ing === "string" ? ing : `${ing.name}${ing.quantity ? ` - ${ing.quantity} ${ing.unit || ""}` : ""}`;
      doc.text(`- ${text}`, 12, 70 + idx * 6);
    });
    doc.text("Instructions:", 10, 70 + (recipe.ingredients?.length || 0) * 6 + 6);
    (recipe.instructions || recipe.steps || []).forEach((step, idx) => {
      doc.text(`${idx + 1}. ${typeof step === "string" ? step : step.instruction || step}`, 12, 76 + (recipe.ingredients?.length || 0) * 6 + idx * 6);
    });
    doc.save(`${recipe.name}.pdf`);
  };

  return (
    <div style={{ padding: "2.5rem 0", maxWidth: 820, margin: "auto" }}>
      <button onClick={() => navigate("/recipe")} style={{ marginBottom: 16, padding: "8px 16px", backgroundColor: orange, border: "none", color: "#fff", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>
        &larr; Back
      </button>

      <h2 style={{ marginBottom: 32, fontWeight: 900, textAlign: "left", background: "linear-gradient(90deg, #000, #888)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", userSelect: "none" }}>PantryChef</h2>

      <div style={filterContainerStyle}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <input type="checkbox" checked={showLikedOnly} onChange={e => setShowLikedOnly(e.target.checked)} /> Show Liked Only
        </label>

        <select value={cuisineFilter} onChange={e => setCuisineFilter(e.target.value)} aria-label="Filter by Cuisine" style={{ padding: "6px 8px", borderRadius: 4 }}>
          {CUISINE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>

        <select value={cookFilter.label} onChange={e => setCookFilter(COOK_TIME_OPTIONS.find(o => o.label === e.target.value))} style={{ padding: "6px 8px", borderRadius: 4 }}>
          {COOK_TIME_OPTIONS.map(opt => <option key={opt.label} value={opt.label}>{opt.label}</option>)}
        </select>

        <select value={prepFilter.label} onChange={e => setPrepFilter(PREP_TIME_OPTIONS.find(o => o.label === e.target.value))} style={{ padding: "6px 8px", borderRadius: 4 }}>
          {PREP_TIME_OPTIONS.map(opt => <option key={opt.label} value={opt.label}>{opt.label}</option>)}
        </select>

        <input type="text" placeholder="Filter keywords (comma separated)" value={keywordsFilter} onChange={e => setKeywordsFilter(e.target.value)} style={{ padding: "6px 8px", borderRadius: 4, minWidth: 180 }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        {filteredRecipes.length === 0 && <p>No matching recipes found.</p>}
        {filteredRecipes.map((recipe, idx) => {
          const imgLeft = idx % 2 === 0;
          const isLiked = likedRecipes.has(recipe.id);
          return (
            <div key={recipe.id} onClick={() => setOpenRecipeId(recipe.id)} style={{ display: "flex", flexDirection: imgLeft ? "row" : "row-reverse", alignItems: "center", background: cardMainColor, color: cardTextColor, borderRadius: "2rem", cursor: "pointer", minHeight: 180, width: "99%", maxWidth: 580, margin: "0 auto", boxShadow: "0 4px 22px 0 rgba(0,0,0,0.3)" }}>
              <div style={{ width: 150, height: 150, borderRadius: "50%", overflow: "hidden", border: `7px solid ${borderColor}`, marginLeft: imgLeft ? -45 : 24, marginRight: imgLeft ? 32 : -45, boxShadow: "0 4px 24px rgba(0,0,0,0.28)", background: "#fff", flexShrink: 0, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <img src={"/" + recipe.image} alt={recipe.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1, margin: "0 18px", minHeight: 150, display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative" }}>
                <h3 style={{ margin: "0 0 16px 0", fontWeight: 700, fontSize: 26, lineHeight: 1.15 }}>{recipe.name}</h3>
                <div style={{ fontSize: 17, color: "#aaa", marginBottom: 8 }}>
                  <span style={{ marginRight: 16 }}>⏱ Prep: {parseTime(recipe.prep_minutes ?? recipe.prep_time ?? recipe.time)} min</span>
                  <span>🥘 Cook: {parseTime(recipe.cook_minutes ?? recipe.cook_time ?? recipe.time)} min</span>
                </div>
                <div onClick={e => toggleLike(recipe.id, e)} style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: isLiked ? orange : cardTextColor, fontSize: 18, cursor: "pointer", alignSelf: imgLeft ? "flex-start" : "flex-end", paddingTop: 6 }} role="button" tabIndex={0}>
                  <span>{isLiked ? "Liked" : "Like"} :</span> {isLiked ? <AiFillHeart size={22} /> : <AiOutlineHeart size={22} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {openRecipe && (
        <div style={modalBackgroundStyle} onClick={() => setOpenRecipeId(null)}>
          <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
            <button aria-label="Close" onClick={() => setOpenRecipeId(null)} style={closeButtonStyle}>×</button>
            <button style={downloadButtonStyle} onClick={() => downloadPDF(openRecipe)}>Download PDF</button>

            <h2 style={{ marginTop: 0, fontWeight: 700, fontSize: 28 }}>{openRecipe.name}</h2>
            {openRecipe.image && <img src={"/" + openRecipe.image} alt={openRecipe.name} style={{ width: "100%", borderRadius: 20, marginBottom: 20, objectFit: "cover", maxHeight: 300 }} />}
            <p><b>Cuisine:</b> {openRecipe.cuisine}</p>
            <p><b>Category:</b> {openRecipe.category}</p>
            <p><b>Servings:</b> {openRecipe.servings}</p>
            <p><b>Prep Time:</b> {parseTime(openRecipe.prep_minutes ?? openRecipe.prep_time ?? openRecipe.time)} min</p>
            <p><b>Cook Time:</b> {parseTime(openRecipe.cook_minutes ?? openRecipe.cook_time ?? openRecipe.time)} min</p>

            <p><b>Ingredients:</b></p>
            <ul>{(openRecipe.ingredients || []).map((ing, i) => <li key={i}>{typeof ing === "string" ? ing : `${ing.name}${ing.quantity ? ` - ${ing.quantity} ${ing.unit || ""}` : ""}`}</li>)}</ul>

            <p><b>Instructions:</b></p>
            <ol>{(openRecipe.instructions || openRecipe.steps || []).map((step, i) => <li key={i}>{typeof step === "string" ? step : step.instruction || step}</li>)}</ol>

            {openRecipe.tips && <><p><b>Tips:</b></p><ul>{openRecipe.tips.map((tip, i) => <li key={i}>{tip}</li>)}</ul></>}

            <button onClick={() => navigate(`/recipe/pantrychef/dishes/${openRecipe.id}`)} style={{ marginTop: 20, width: "100%", padding: "12px 0", backgroundColor: orange, color: "#fff", border: "none", borderRadius: 10, fontSize: 16, fontWeight: "bold", cursor: "pointer" }}>Get Started</button>
          </div>
        </div>
      )}

      {openRecipe && (
        <button onClick={handleCookedClick} style={cookedButtonStyle} aria-label="Mark recipe as cooked">Cooked</button>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </div>
  );
>>>>>>> 5b84da3 (Update backend and frontend components)
};
export default PantryChef;
