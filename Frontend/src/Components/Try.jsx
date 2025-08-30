import React, { useState, useMemo } from "react";
import recipesData from "../data/recipe.json"; // your JSON file

const CUISINE_OPTIONS = ["All", "Asian", "Middle Eastern", "European", "American", "African"];
const CATEGORY_OPTIONS = [
  "All", "Breakfast", "Lunch", "Dinner", "Brunch", "Dessert",
  "Snacks", "Starter", "Salads", "Beverages"
];
const PREP_TIME_OPTIONS = [
  { label: "Any", min: 0, max: Infinity },
  { label: "< 10 min", min: 0, max: 10 },
  { label: "< 20 min", min: 0, max: 20 },
  { label: "< 30 min", min: 0, max: 30 },
  { label: ">= 30 min", min: 30, max: Infinity }
];
const COOK_TIME_OPTIONS = [...PREP_TIME_OPTIONS];

const getRecipeLabel = (recipe) => {
  if ((recipe.tags || []).includes('vegan')) return { text: "vegan food", color: "#f7c948" };
  if ((recipe.tags || []).includes('protein')) return { text: "full of protein", color: "#ffe066" };
  if ((recipe.tags || []).includes('fats')) return { text: "saturated with fats", color: "#ffe066" };
  return { text: "healthy choice", color: "#e0e0e0" };
};

const PantryChef = () => {
  const [openRecipeId, setOpenRecipeId] = useState(null);
  // Filters
  const [cuisineFilter, setCuisineFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [prepFilter, setPrepFilter] = useState(PREP_TIME_OPTIONS[0]);
  const [cookFilter, setCookFilter] = useState(COOK_TIME_OPTIONS);
  const [vegFilter, setVegFilter] = useState("All");
  const [keywordsFilter, setKeywordsFilter] = useState("");

  const recipesArray = Array.isArray(recipesData?.recipes) ? recipesData.recipes : [];

  const filteredRecipes = useMemo(() => {
    const keywordsArray = keywordsFilter
      .toLowerCase()
      .split(",")
      .map(k => k.trim())
      .filter(k => k.length > 0);

    return recipesArray.filter(recipe => {
      if (cuisineFilter !== "All" && (recipe.cuisine || '').toLowerCase() !== cuisineFilter.toLowerCase()) return false;
      if (categoryFilter !== "All" && (recipe.category || '').toLowerCase() !== categoryFilter.toLowerCase()) return false;
      if ((recipe.prep_minutes ?? 0) < prepFilter.min || (recipe.prep_minutes ?? 0) > prepFilter.max) return false;
      if ((recipe.cook_minutes ?? 0) < cookFilter.min || (recipe.cook_minutes ?? 0) > cookFilter.max) return false;
      if (vegFilter !== "All") {
        const tagsLower = (recipe.tags || []).map(t => t.toLowerCase());
        if (vegFilter === "Vegetarian" && !tagsLower.includes("vegetarian")) return false;
        if (vegFilter === "Non-Vegetarian" && tagsLower.includes("vegetarian")) return false;
      }
      if (keywordsArray.length > 0) {
        const recipeKeywords = (recipe.keywords || []).map(k => k.toLowerCase());
        const hasKeyword = keywordsArray.some(k => recipeKeywords.includes(k));
        if (!hasKeyword) return false;
      }
      return true;
    });
  }, [recipesArray, cuisineFilter, categoryFilter, prepFilter, cookFilter, vegFilter, keywordsFilter]);

  const cardMainColor = "#33353e";
  const cardTextColor = "#fff";
  const borderColor = "#23242a";
  const orange = "#FFA500";

  return (
    <div style={{ padding: "2.5rem 0", maxWidth: 820, margin: "auto" }}>
      <h2 style={{ marginBottom: "2rem", textAlign: "left" }}>PantryChef</h2>

      {/* Filters */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1.2rem",
        marginBottom: "2.5rem",
        background: "#1b1c22",
        borderRadius: 16,
        padding: "1.2rem 2rem"
      }}>
        <div style={{ minWidth: 130 }}>
          <label>Cuisine:&nbsp;</label>
          <select value={cuisineFilter} onChange={e => setCuisineFilter(e.target.value)} style={{ padding: "0.45rem" }}>
            {CUISINE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div style={{ minWidth: 130 }}>
          <label>Category:&nbsp;</label>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ padding: "0.45rem" }}>
            {CATEGORY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div style={{ minWidth: 120 }}>
          <label>Prep Time:&nbsp;</label>
          <select value={prepFilter.label}
            onChange={e => setPrepFilter(PREP_TIME_OPTIONS.find(opt => opt.label === e.target.value))}
            style={{ padding: "0.45rem" }}>
            {PREP_TIME_OPTIONS.map(opt => <option key={opt.label} value={opt.label}>{opt.label}</option>)}
          </select>
        </div>
        <div style={{ minWidth: 120 }}>
          <label>Cook Time:&nbsp;</label>
          <select value={cookFilter.label}
            onChange={e => setCookFilter(COOK_TIME_OPTIONS.find(opt => opt.label === e.target.value))}
            style={{ padding: "0.45rem" }}>
            {COOK_TIME_OPTIONS.map(opt => <option key={opt.label} value={opt.label}>{opt.label}</option>)}
          </select>
        </div>
        <div style={{ minWidth: 110 }}>
          <label>Veg/Non-Veg:&nbsp;</label>
          <select value={vegFilter}
            onChange={e => setVegFilter(e.target.value)}
            style={{ padding: "0.45rem" }}>
            {["All", "Vegetarian", "Non-Vegetarian"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div style={{ flexGrow: 1, minWidth: 200 }}>
          <label>Keywords (comma separated):&nbsp;</label>
          <input
            type="text"
            value={keywordsFilter}
            placeholder="e.g. paneer, butter"
            onChange={e => setKeywordsFilter(e.target.value)}
            style={{ padding: "0.45rem", width: "85%" }}
          />
        </div>
      </div>

      {/* Recipe cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        {filteredRecipes.length === 0 ? (
          <p>No recipes found.</p>
        ) : (
          filteredRecipes.map((recipe, idx) => {
            const label = getRecipeLabel(recipe);
            const imgLeft = idx % 2 === 0;
            return (
              <div
                key={recipe.id}
                onClick={() => setOpenRecipeId(openRecipeId === recipe.id ? null : recipe.id)}
                style={{
                  display: "flex",
                  flexDirection: imgLeft ? "row" : "row-reverse",
                  alignItems: "center",
                  background: cardMainColor,
                  color: cardTextColor,
                  borderRadius: "2rem",
                  cursor: "pointer",
                  minHeight: 180,
                  width: "99%",
                  maxWidth: 580,
                  margin: "0 auto",
                  boxShadow: "0 4px 22px 0 rgb(0 0 0 / 0.30)",
                  transition: "box-shadow 0.2s"
                }}
              >
                <div style={{
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
                  position: "relative",
                  zIndex: 2
                }}>
                  <img
                    src={recipe.image || "/default_recipe.jpg"}
                    alt={recipe.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div style={{ flex: 1, margin: "0 18px", minHeight: 150 }}>
                  <h3 style={{ margin: "0 0 16px 0", fontWeight: 700, fontSize: 26, lineHeight: 1.15 }}>
                    {recipe.name}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 17, marginBottom: 18 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      ⏱ {recipe.prep_minutes} min
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      🥘 {recipe.cook_minutes} min
                    </span>
                  </div>
                  <div style={{
                    padding: "5px 20px",
                    display: "inline-block",
                    background: label.color,
                    borderRadius: 16,
                    color: "#222",
                    fontWeight: 700,
                    fontSize: 14,
                    marginTop: 3
                  }}>
                    {label.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {/* Expanded details */}
        {openRecipeId && (() => {
          const r = filteredRecipes.find(x => x.id === openRecipeId);
          if (!r) return null;
          const label = getRecipeLabel(r);
          return (
            <div style={{
              margin: "2rem auto 0 auto",
              background: "#181824",
              color: "#fff",
              borderRadius: 32,
              padding: "2.5rem 2.3rem 2.7rem 2.3rem",
              boxShadow: "0 2px 18px 0 #0007",
              animation: "fadeIn 0.44s",
              width: "99%",
              maxWidth: 640,
              position: "relative",
              zIndex: 20
            }}>
              <h2 style={{ marginTop: 0, fontWeight: 700, fontSize: 28 }}>{r.name}</h2>
              <div style={{ maxHeight: 420, overflowY: "auto", scrollBehavior: "smooth", paddingRight: 16 }}>
                <p><b>Cuisine:</b> {r.cuisine}</p>
                <p><b>Category:</b> {r.category}</p>
                <p><b>Servings:</b> {r.servings}</p>
                <p><b>Preparation Time:</b> {r.prep_minutes} min</p>
                <p><b>Cooking Time:</b> {r.cook_minutes} min</p>
                <p><b>Ingredients:</b></p>
                <ul>{(r.ingredients || []).map((ing, i) =>
                  <li key={i}>{ing.name} {ing.quantity ? `- ${ing.quantity} ${ing.unit || ""}` : ""}</li>)}
                </ul>
                <p><b>Steps:</b></p>
                <ol>{(r.steps || []).map(st =>
                  <li key={st.step}>{st.instruction}</li>
                )}</ol>
              </div>
              <button
                style={{
                  marginTop: 32,
                  padding: "15px 48px",
                  background: orange,
                  color: "#fff",
                  border: "none",
                  borderRadius: 22,
                  fontWeight: 800,
                  fontSize: 19,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px 0 #0002",
                  letterSpacing: "0.5px"
                }}
                onClick={() => setOpenRecipeId(null)}
              >Close</button>
            </div>
          );
        })()}
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </div>
  );
};

export default PantryChef;
