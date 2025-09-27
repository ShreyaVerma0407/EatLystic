import React, { useState, useEffect } from "react";
import Navbar from './Navbar'; // This line was already present in your previous code

// The base URL of your Express API
const API_BASE_URL = "http://localhost:3001/api/recipes/cooked"; 

// --- Utility Functions ---

/**
 * Checks if a date falls on today's date (ignoring time).
 * @param {string} dateString - The ISO date string from the database.
 */
const isToday = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

// --- UPDATED: Circular Progress Bar Component with Conic Gradient ---
const CircularProgressBar = ({ value, unit, label, icon, percentage, color = '#22c55e' }) => {
    // Calculates percentage (e.g., 800 kcal max, 80g max for macros)
    const maxGoal = label === 'Calories' ? 800 : 80; 
    const displayPercentage = percentage || Math.min(100, Math.round((value / maxGoal) * 100));
    
    // Conic gradient simulates the progress fill moving around the circle's border
    const progressStyle = {
        position: 'relative',
        width: '80px', // Size of the circle
        height: '80px',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: `conic-gradient(${color} ${displayPercentage * 3.6}deg, #2d2d34 0deg)`,
        boxShadow: '0 0 5px rgba(0, 0, 0, 0.5)',
        transition: 'background 0.5s ease-in-out', 
    };
    
    // Inner circle to mask the center, making the gradient look like a border fill
    const innerCircleStyle = {
        position: 'absolute',
        width: '65px',
        height: '65px',
        borderRadius: '50%',
        backgroundColor: '#1f1f24', // Must match the card background for seamless integration
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    };

    return (
        <div 
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.4rem',
                minWidth: '90px',
                maxWidth: '120px',
            }}
        >
            <div style={progressStyle}>
                <div style={innerCircleStyle}>
                    <span style={{ fontSize: '1.2rem', color: color }}>{icon}</span>
                    <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1rem', marginTop: '0.1rem' }}>
                        {displayPercentage}%
                    </span>
                </div>
            </div>
            <p style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 'bold', margin: 0 }}>{label}</p>
            <p style={{ color: '#a1a1aa', fontSize: '0.8rem', margin: 0 }}>
                {value}{unit}
            </p>
        </div>
    );
};


// --- Recipe Card Component (Enhanced) ---

const RecipeCard = ({ recipe }) => {
  const formatNutrition = (content) => {
    if (!content || typeof content !== 'object' || Object.keys(content).length === 0) {
      return []; 
    }

    return Object.entries(content)
      .map(([key, value]) => {
        const unit = key.includes('g') ? 'g' : (key.includes('kcal') ? 'kcal' : '');
        const cleanKey = key.replace(/(_g|_kcal)$/i, '');

        let icon = '';
        let color = '#22c55e'; // Default color
        
        switch(cleanKey.toLowerCase()) {
            case 'calories': icon = '🔥'; color = '#FFD700'; break; // Gold
            case 'protein': icon = '🍗'; color = '#38bdf8'; break; // Sky Blue
            case 'carbohydrates': icon = '🍞'; color = '#f97316'; break; // Orange
            case 'fat': icon = '🧈'; color = '#FFC0CB'; break; // Pink
            // Removed: case 'fiber': icon = '🥦'; color = '#10b981'; break; // Fiber data is now ignored
            default: icon = '✨'; color = '#a1a1aa';
        }

        return { 
            name: cleanKey.charAt(0).toUpperCase() + cleanKey.slice(1), 
            value: parseFloat(value), 
            unit: unit || '',
            icon: icon,
            color: color
        };
      });
  };

  const nutritionDetails = formatNutrition(recipe.nutritionalContent);

  const cookedDate = new Date(recipe.cookedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const cookedTime = new Date(recipe.cookedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  
  // Exclude Fiber from MacroNutrients list
  const macroNutrients = nutritionDetails.filter(d => 
    d.name === 'Calories' || d.name === 'Protein' || d.name === 'Carbohydrates' || d.name === 'Fat'
  );
  
  // Filter for other nutrients, and explicitly exclude Fiber
  const otherNutrients = nutritionDetails.filter(d => 
    (d.name !== 'Calories' && d.name !== 'Protein' && d.name !== 'Carbohydrates' && d.name !== 'Fat') &&
    d.name !== 'Fiber' // <-- Explicitly exclude Fiber here
  );

  return (
    <div 
      className="intake-recipe-card"
      style={{
        backgroundColor: '#1f1f24',
        padding: '1.5rem',
        borderRadius: '0.75rem',
        border: '1.5px solid rgba(255, 255, 255, 1)', 
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'row', 
        gap: '2rem',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
        transition: 'transform 0.3s, box-shadow 0.3s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.01)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(249, 115, 22, 0.2)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
      }}
    >
      
      {/* LEFT DIV: Name, Cooked On Date, Cooked At Time */}
      <div 
        style={{ 
          flex: 1, 
          paddingRight: '2rem',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <h4 
          style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: '#f97316', 
            marginBottom: '0.5rem' 
          }}
        >
          {recipe.name}
        </h4>
        <p style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.2rem' }}>
          Cooked On: <span style={{ color: '#a1a1aa' }}>{cookedDate}</span>
        </p>
        <p style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
          Time: <span style={{ color: '#a1a1aa' }}>{cookedTime}</span>
        </p>
      </div>

      {/* RIGHT DIV: Nutritional Content with Circular Progress Bars */}
      <div style={{ flex: 1.5, paddingLeft: '1rem' }}>
        <h5 style={{ fontSize: '1.25rem', color: '#22c55e', marginBottom: '0.75rem' }}>
          Nutritional Status
        </h5>
        
        {/* Container for Circular Progress Bars (Macros) */}
        <div style={{ 
            display: 'flex', 
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: '1rem', 
            marginBottom: '1rem',
            paddingBottom: '1rem',
            borderBottom: '1px dotted #3f3f46',
        }}>
          {macroNutrients.map(detail => (
            <CircularProgressBar 
                key={detail.name}
                value={detail.value}
                unit={detail.unit}
                label={detail.name}
                icon={detail.icon}
                color={detail.color}
            />
          ))}
        </div>

        {/* List for Other Nutrients (Fiber is excluded from otherNutrients filter) */}
        {otherNutrients.length > 0 && (
            <div style={{ marginTop: '1rem', paddingTop: '0.5rem' }}>
                {otherNutrients.map(detail => (
                    <div key={detail.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0' }}>
                        <span style={{ color: '#a1a1aa' }}>{detail.name}</span>
                        <span style={{ color: '#fff', fontWeight: 'bold' }}>{detail.value}{detail.unit}</span>
                    </div>
                ))}
            </div>
        )}

        {/* Fallback message for missing nutrition data */}
        {nutritionDetails.length === 0 && (
            <span style={{ color: '#f87171', fontStyle: 'italic', gridColumn: 'span 2' }}>
                Nutritional data unavailable.
            </span>
        )}
      </div>
    </div>
  );
};

// --- Main Intake Page Component (Navigation Handlers kept) ---

const IntakePage = ({ onBack, navigateToRecipes }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [todayRecipes, setTodayRecipes] = useState([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch(API_BASE_URL);

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 404 && errorData.message.includes("No cooked recipes")) {
             setRecipes([]);
          } else {
             throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
          }
        } else {
          const data = await response.json();
          setRecipes(data.data || []);
          
          // Filter to only show today's recipes
          const filteredRecipes = (data.data || []).filter(recipe => isToday(recipe.cookedAt));
          setTodayRecipes(filteredRecipes);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load recipes. Please check server connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  // Navigation handlers (using window.location for forced routing)
  const handleNavigateToRecipes = () => {
    window.location.href = "/recipe/mealchef"; 
  };

  const handleGoBack = () => {
    window.location.href = "/recipe/macroschef/dash";
  };


  return (
    // Outer container for the whole page
    <div style={{ minHeight: '100vh', backgroundColor: '#121215', color: '#fff' }}>
        
        {/* --- NAVBAR CONTAINER (Sticky and Full Width) --- */}
        <div 
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 1000, // Ensure it stays on top of other content
                width: '100%',
                backgroundColor: '#1f1f24', // Example dark background for Navbar container
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
            }}
        >
            <Navbar/>
        </div>
        
        {/* Content Container (Pushed down by Navbar) */}
        <div className="page-container" style={{ padding: '1.5rem', paddingTop: '1rem' }}>
            <h1 
                style={{ 
                    fontSize: '3rem', 
                    fontWeight: 'bold', 
                    color: '#f97316', 
                    marginBottom: '1.5rem' 
                }}
            >
                Today's Intake: Consumed Meals 🍽️
            </h1>
            
            {loading && <p style={{ color: '#a1a1aa' }}>Loading your cooked recipes...</p>}
            {error && <p style={{ color: '#ef4444' }}>Error: {error}</p>}
            
            {/* --- Filtered Recipes List --- */}
            {!loading && !error && todayRecipes.length > 0 && (
                <div className="recipes-list">
                    {todayRecipes.map(recipe => (
                        <RecipeCard key={recipe._id} recipe={recipe} />
                    ))}
                </div>
            )}
            
            {/* --- No Data State (Custom Message) --- */}
            {!loading && !error && todayRecipes.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem', backgroundColor: '#1a1a1f' }}>
                    <p style={{ fontSize: '1.25rem', color: '#fff', fontWeight: '500', marginBottom: '1rem' }}>
                        ✨ Oops! It seems like you haven't logged anything today! ✨<br/><br/>
                        🍳 Ready to cook up some deliciousness? 🍴<br/>
                        Let’s get those culinary skills sizzling! 😋 </p>
                    
                    <button
                        onClick={handleNavigateToRecipes}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#f97316',
                            color: '#000',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ea580c'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f97316'}
                    >
                        Explore Recipes Here 🥘
                    </button>
                </div>
            )}

            {/* --- Navigation Buttons --- */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button
                    onClick={handleGoBack}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: 'transparent',
                        color: '#f97316',
                        border: '2px solid #f97316',
                        borderRadius: '0.75rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s, color 0.2s',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = '#f97316';
                        e.currentTarget.style.color = '#000';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#f97316';
                    }}
                >
                    ← Go Back to Dashboard
                </button>
            </div>
        </div>
    </div>
  );
};

export default IntakePage;