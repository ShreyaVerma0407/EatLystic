import React, { useState, useEffect } from 'react';
// NOTE: You must install and use react-router-dom for useNavigate to work
import { useNavigate } from 'react-router-dom';
import '../styles/MacrosRecipe.css'; 
import Navbar from './Navbar';
// --- RecipeModal Component (Unchanged) ---
const RecipeModal = ({ recipe, onClose }) => {
    if (!recipe) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <h2>{recipe.title}</h2>
                <div className="modal-body-content">
                    <div className="modal-section">
                        <h3>Ingredients</h3>
                        <ul className="ingredients-list">
                            {recipe.ingredients.map((item, index) => (<li key={index}>{item}</li>))}
                        </ul>
                    </div>
                    <div className="modal-section">
                        <h3>Instructions</h3>
                        <ol className="instructions-list">
                            {recipe.instructions.map((step, index) => (<li key={index}>{step}</li>))}
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Reusable RecipeCard Component (Unchanged)
const RecipeCard = ({ recipe, onClick }) => {
    // Fallback to 'Easy' if difficulty is not set in the data
    const difficultyText = recipe.difficulty || 'Easy';
    // Create a lowercase class name (e.g., 'Easy' -> 'easy')
    const difficultyClass = difficultyText.toLowerCase();

    return (
        <div className="recipe-card" onClick={() => onClick(recipe)}>
            <div className="recipe-image-wrapper">
                <img src={recipe.image} alt={recipe.title} className="recipe-image"/>
                {/* Dynamically assign the badge class and display the difficulty text */}
                <span className={`badge ${difficultyClass}`}>{difficultyText}</span>
            </div>
            <div className="recipe-info">
                <div className="details">
                    <p><span className="icon-time">&#x23F1;</span> {recipe.time}</p>
                    <p><span className="icon-servings">&#x1F963;</span> {recipe.servings}</p>
                </div>
                <h3 className="recipe-title">{recipe.title}</h3>
                <div className="nutrition-grid">
                    <div className="nutrition-item"><span className="value">{recipe.calories}</span><span className="label">Calories</span></div>
                    <div className="nutrition-item"><span className="value">{recipe.protein}</span><span className="label">Protein</span></div>
                    <div className="nutrition-item"><span className="value">{recipe.carbs}</span><span className="label">Carbs</span></div>
                    <div className="nutrition-item"><span className="value">{recipe.fat}</span><span className="label">Fat</span></div>
                </div>
            </div>
        </div>
    );
};


// Main Component
const RecipeHub = () => {
    const [recipeData, setRecipeData] = useState({ FILTER_GROUPS: [], ALL_RECIPES: [] });
    const [activeFilters, setActiveFilters] = useState({});
    const [selectedRecipe, setSelectedRecipe] = useState(null); 
    const [isLoading, setIsLoading] = useState(true);

    // Initialize the useNavigate hook for navigation
    const navigate = useNavigate();

    // Actual navigation function using useNavigate
    const handleGoToDashboard = () => {
        const dashboardPath = "/recipe/macroschef/dash";
        navigate(dashboardPath);
    };

    // --- Data Fetching Effect ---
    useEffect(() => {
        // Function to assign a random difficulty (for dynamic testing)
        const assignRandomDifficulty = (recipes) => {
            const difficulties = ["Easy", "Medium", "Hard"];
            return recipes.map(recipe => ({
                ...recipe,
                // If difficulty is missing, assign a random one
                difficulty: recipe.difficulty || difficulties[Math.floor(Math.random() * difficulties.length)]
            }));
        };

        fetch('/data/macrosrecipe.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const recipesWithDifficulty = assignRandomDifficulty(data.ALL_RECIPES);
                setRecipeData({ 
                    ...data, 
                    ALL_RECIPES: recipesWithDifficulty 
                });
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Failed to fetch recipe data:", error);
                setIsLoading(false);
            });
    }, []);


    const handleFilterChange = (event, groupName) => {
        const filterValue = event.target.value;
        const isChecked = event.target.checked;
        
        setActiveFilters(prevFilters => {
            return {
                ...prevFilters,
                [groupName.toLowerCase()]: isChecked ? filterValue : null
            };
        });
    };

    const getFilteredRecipes = () => {
        const { ALL_RECIPES } = recipeData;
        const filtersToApply = Object.values(activeFilters).filter(val => val !== null);
        
        if (filtersToApply.length === 0) {
            return ALL_RECIPES;
        }

        return ALL_RECIPES.filter(recipe => {
            return filtersToApply.every(filter => recipe.tags.includes(filter));
        });
    };

    const filteredRecipes = getFilteredRecipes();
    const FILTER_GROUPS = recipeData.FILTER_GROUPS;

    if (isLoading) {
        return <div className="recipe-hub-page container" style={{textAlign: 'center', paddingTop: '100px', color: 'var(--accent-color)'}}>Loading Recipes...</div>;
    }

    return (
        <div className="recipe-hub-page">
            <Navbar/>
            {/* UPDATED HEADER SECTION */}
            <header className="header">
                <div className="header-image-overlay">
                    <div className="header-text-content"> 
                        <h1>
                            <span className="icon-hat">&#x1F373;</span> Recipe Hub <span className="icon-star">&#x2728;</span>
                        </h1>
                        <p className="header-description">Discover amazing recipes with detailed nutritional information and step-by-step instructions</p>
                    </div>
                </div>
            </header>

            <main className="container">
                <section className="filter-section">
                    <h2>Filter Healthy Recipes</h2>
                    <div className="filters-grid">
                        {FILTER_GROUPS.map((group) => (
                            <div key={group.groupName} className="filter-group-item">
                                <div className="filter-group-title">{group.groupName}:</div>
                                
                                {/* UP Radio Button */}
                                <label className="filter-option-radio">
                                    <input 
                                        type="radio" 
                                        name={group.groupName.toLowerCase()} 
                                        value={group.upValue} 
                                        onChange={(e) => handleFilterChange(e, group.groupName.toLowerCase())}
                                        checked={activeFilters[group.groupName.toLowerCase()] === group.upValue}
                                    />
                                    <span className="checkmark-radio"></span>
                                    <span className="filter-label-text">{group.upLabel}</span>
                                </label>

                                {/* DOWN Radio Button */}
                                <label className="filter-option-radio">
                                    <input 
                                        type="radio" 
                                        name={group.groupName.toLowerCase()} 
                                        value={group.downValue} 
                                        onChange={(e) => handleFilterChange(e, group.groupName.toLowerCase())}
                                        checked={activeFilters[group.groupName.toLowerCase()] === group.downValue}
                                    />
                                    <span className="checkmark-radio"></span>
                                    <span className="filter-label-text">{group.downLabel}</span>
                                </label>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="recipe-list">
                    <h2 className="section-title">Healthy Recipes</h2>
                    <p className="section-subtitle">Nutritious recipes perfect for a healthy lifestyle</p>
                    <div className="recipe-cards-grid">
                        {filteredRecipes.length > 0 ? (
                            filteredRecipes.map(recipe => (
                                <RecipeCard key={recipe.id} recipe={recipe} onClick={setSelectedRecipe} />
                            ))
                        ) : (
                            <p className="no-results">No recipes match the selected filters. Try broadening your search!</p>
                        )}
                    </div>
                </section>
                
                {/* DASHBOARD BUTTON (now uses regular margin/flow) */}
                <button 
                    className="back-to-dashboard-btn-static" // Changed class name
                    onClick={handleGoToDashboard}
                >
                    &larr; Back to Dashboard
                </button>
            </main>
            
            <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)}/>
        </div>
    );
};

export default RecipeHub;