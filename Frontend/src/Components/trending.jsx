import React, { useState, useEffect } from "react";
import Navbar from './Navbar';
import Footer from './Footer';

// Define the categories array as it is not part of the JSON data
const categories = ["All","Breakfast","Lunch","Dinner","Dessert","Snacks","Vegetarian","Quick & Easy","Beverages", "Quick Snack", "Side Dish"];

// ---------------- Recipe Filters ----------------
const RecipeFilters = ({ selectedCategory, onCategoryChange }) => (
  <div className="recipe-filters">
    {categories.map((cat) => (
      <button
        key={cat}
        className={`filter-btn ${selectedCategory === cat ? "active" : ""}`}
        onClick={() => onCategoryChange(cat)}
      >
        {cat}
      </button>
    ))}
  </div>
);

// ---------------- Recipe Card ----------------
const RecipeCard = ({ recipe }) => {
  const openVideo = (url) => {
    window.open(url, "_blank"); // open video in new tab
  };

  return (
    <div className="recipe-card" onClick={() => openVideo(recipe.video)} style={{cursor:"pointer"}}>
      <img
        src={recipe.thumbnail}
        alt={recipe.title}
        style={{
          width: "100%",
          height: "180px",
          objectFit: "cover",
          borderRadius: "12px 12px 0 0"
        }}
      />
      <div className="recipe-info">
        <span className="category-badge">{recipe.category}</span>
        <h3>{recipe.title}</h3>
        <p>{recipe.description}</p>
        <div className="stats">
          <span>⏱ {recipe.cookTime}</span>
          <span>👥 {recipe.servings}</span>
          <span className="rating">
            {Array.from({length:5}, (_,i) => (
              <span key={i} style={{color: i < Math.round(recipe.rating) ? "#ffc107" : "#555"}}>★</span>
            ))}
          </span>
        </div>
        <span className={`difficulty ${recipe.difficulty.toLowerCase()}`}>{recipe.difficulty}</span>
      </div>
    </div>
  );
};

// ---------------- Hero Section ----------------
const HeroSection = ({ searchQuery, onSearchChange }) => (
  <section className="hero-section">
    <div className="hero-overlay">
      <h1>🔥 Trending Recipes</h1>
      <p>From viral TikTok sensations to chef-approved classics, find the recipes everyone's talking about.</p>
      <input type="text" placeholder="Search recipes..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} />
    </div>
  </section>
);

// ---------------- Main Component ----------------
const TrendingPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [trendingRecipes, setTrendingRecipes] = useState([]); // State to hold the fetched data
  const [isLoading, setIsLoading] = useState(true); // State for loading

  // Effect to fetch data from trending.json
  useEffect(() => {
    fetch("/data/trending.json") // Assumes /public/data/trending.json
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setTrendingRecipes(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching trending recipes:", error);
        setIsLoading(false);
        // Optionally set an error state here
      });
  }, []); // Empty dependency array means this runs once on mount

  const filteredRecipes = trendingRecipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) || recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Display a loading message while data is being fetched
  if (isLoading) {
    return (
      <div className="trending-page" style={{textAlign:"center", padding:"50px", fontSize:"1.5rem", color:"#fc8019"}}>
        <p>Loading recipes... 🚀</p>
        {/* You should keep the CSS for styling */}
        <style>{`
          body { margin:0; font-family:Arial,sans-serif; background:#1e1e1e; color:#fff; }
          .trending-page { background: linear-gradient(to bottom, #1e1e1e, #121212); min-height: 100vh; }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <div style={{position:"sticky", top:0, zIndex:1000, width:"100%"}}>
        <Navbar />
      </div>
      <div className="trending-page">
        <style>{`
          body { margin:0; font-family:Arial,sans-serif; background:#1e1e1e; color:#fff; }
          .hero-section { position: relative; background: linear-gradient(135deg,#fc8019cc,#ff6b6bcc); padding:80px 20px; text-align:center; }
          .hero-section h1 { font-size:3rem; margin-bottom:1rem; color:#fff; }
          .hero-section p { font-size:1.2rem; margin-bottom:2rem; color:#ffe5cc; }
          .hero-section input { padding:0.8rem 1rem; font-size:1rem; border-radius:8px; border:none; width:300px; }
          .recipe-filters { display:flex; flex-wrap:wrap; justify-content:center; gap:10px; margin:20px 0; }
          .filter-btn { padding:0.5rem 1rem; border-radius:20px; border:2px solid #fc8019; background:transparent; color:#fc8019; cursor:pointer; transition:all 0.3s ease; }
          .filter-btn.active, .filter-btn:hover { background:#fc8019; color:#fff; }
          .recipes-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:20px; padding:0 20px 40px 20px; }
          .recipe-card { position:relative; background:#2a2a2a; border-radius:12px; overflow:hidden; transition: transform 0.3s ease, box-shadow 0.3s ease; }
          .recipe-card:hover { transform:translateY(-8px); box-shadow:0 12px 20px rgba(252,128,25,0.5); }
          .recipe-info { padding:15px; }
          .recipe-info h3 { margin:0 0 5px 0; font-size:1.2rem; color:#fc8019; }
          .recipe-info p { font-size:0.9rem; color:#ccc; margin-bottom:10px; }
          .stats { display:flex; justify-content:space-between; font-size:0.85rem; color:#ddd; margin-bottom:10px; }
          .rating span { font-size:1rem; margin-right:2px; }
          .category-badge { position:absolute; top:10px; right:10px; background:#fc801980; padding:3px 8px; border-radius:8px; font-size:0.75rem; }
          .difficulty { padding:2px 6px; border-radius:5px; font-size:0.75rem; }
          .difficulty.easy { background:#4caf50; color:#fff; }
          .difficulty.medium { background:#ff9800; color:#fff; }
          .difficulty.hard { background:#f44336; color:#fff; }
          .no-results { text-align:center; margin:40px 0; color:#ccc; font-size:1.2rem; }
          .trending-page {
            min-height: 100vh;
            background: linear-gradient(to bottom, #1e1e1e, #121212);
          }
        `}</style>

        <HeroSection searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <RecipeFilters selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
        <div className="recipes-grid">
          {filteredRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
        </div>
        {filteredRecipes.length === 0 && <p className="no-results">No recipes found.</p>}
      </div><Footer/>
    </>
  );
};

export default TrendingPage;