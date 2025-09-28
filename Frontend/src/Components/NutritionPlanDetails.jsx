import React, { useState, useEffect } from "react";

// The base URL of your Express API (must be consistent with IntakePage)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const COOKED_RECIPES_URL = `${API_BASE_URL}/recipes/cooked`;


// --- Utility Functions (Replicated from IntakePage) ---

/**
 * Checks if a date falls on today's date (ignoring time).
 */
const isToday = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

/**
 * Formats raw nutritional content object into a standardized array.
 */
const formatNutrition = (content) => {
    if (!content || typeof content !== 'object' || Object.keys(content).length === 0) {
        return []; 
    }

    return Object.entries(content)
        .map(([key, value]) => {
            const unit = key.includes('g') ? 'g' : (key.includes('kcal') ? 'kcal' : '');
            const cleanKey = key.replace(/(_g|_kcal)$/i, '');
            
            let icon = '';
            let color = '#a1a1aa'; // Default color
            
            // Logic copied from RecipeCard in IntakePage
            switch(cleanKey.toLowerCase()) {
                case 'calories': icon = '🔥'; color = '#FFD700'; break;
                case 'protein': icon = '🍗'; color = '#38bdf8'; break;
                case 'carbohydrates': icon = '🍞'; color = '#f97316'; break;
                case 'fat': icon = '🧈'; color = '#FFC0CB'; break;
                default: icon = '✨'; color = '#a1a1aa';
            }

            return { 
                name: cleanKey.charAt(0).toUpperCase() + cleanKey.slice(1), 
                value: parseFloat(value) || 0,
                unit: unit || '',
                icon: icon,
                color: color
            };
        })
        .filter(d => d.name !== 'Fiber'); // Exclude Fiber
};

// --- Helper Components for Display ---

const getUnit = (name) => (name === 'Calories' ? 'kcal' : 'g');

const SummaryCard = ({ name, value, color }) => (
    <div 
        style={{ 
            padding: '0.75rem', 
            border: `1px solid ${color}`, 
            borderRadius: '0.5rem', 
            minWidth: '100px', 
            textAlign: 'center',
            backgroundColor: 'rgba(31, 31, 36, 0.5)' 
        }}
    >
        <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.9rem' }}>{name}</p>
        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.2rem', color: color }}>
            {Math.round(value)}{getUnit(name)}
        </p>
    </div>
);

const RecipeDetail = ({ recipe }) => {
    const nutrients = formatNutrition(recipe.nutritionalContent);
    const macros = nutrients.filter(n => ['Calories', 'Protein', 'Carbohydrates', 'Fat'].includes(n.name));
    
    return (
        <div style={{ 
            borderBottom: '1px dotted #3f3f46', 
            padding: '0.75rem 0', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap'
        }}>
            <h4 style={{ margin: 0, color: '#f97316', fontSize: '1.2rem', minWidth: '150px' }}>{recipe.name}</h4>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {macros.map(n => (
                    <span key={n.name} style={{ color: n.color, fontWeight: '500' }}>
                        {n.icon} {n.name}: {Math.round(n.value)}{n.unit}
                    </span>
                ))}
            </div>
        </div>
    );
};

// --- Main Plan Details Component ---

const NutritionPlanDetails = ({ userGoals }) => {
    const [todayIntake, setTodayIntake] = useState([]);
    const [intakeSummary, setIntakeSummary] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchIntakeData = async () => {
            try {
                 const response = await fetch(COOKED_RECIPES_URL);

                if (!response.ok) {
                    const errorData = await response.json();
                    if (response.status === 404 && errorData.message.includes("No cooked recipes")) {
                        setTodayIntake([]);
                    } else {
                        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
                    }
                } else {
                    const data = await response.json();
                    const allRecipes = data.data || [];
                    
                    const filteredRecipes = allRecipes.filter(recipe => isToday(recipe.cookedAt));
                    
                    const initialSummary = { Calories: 0, Protein: 0, Carbohydrates: 0, Fat: 0 };
                    
                    const summary = filteredRecipes.reduce((acc, recipe) => {
                        const nutrients = formatNutrition(recipe.nutritionalContent);
                        nutrients.forEach(n => {
                            if (n.name === 'Calories') acc.Calories += n.value;
                            if (n.name === 'Protein') acc.Protein += n.value;
                            if (n.name === 'Carbohydrates') acc.Carbohydrates += n.value;
                            if (n.name === 'Fat') acc.Fat += n.value;
                        });
                        return acc;
                    }, initialSummary);

                    setTodayIntake(filteredRecipes);
                    setIntakeSummary(summary);
                }
            } catch (err) {
                console.error("Fetch error:", err);
                setError("Failed to load today's intake. Please check server connection.");
            } finally {
                setLoading(false);
            }
        };

        fetchIntakeData();
    }, []);

    // Helper to determine macro achievement percentage and color
    const getMacroStatus = (macroName, actual, goal) => {
        if (!goal || goal === 0) return { percent: 0, color: '#a1a1aa' };
        
        const percent = Math.min(150, Math.round((actual / goal) * 100)); // Cap percent display at 150 for visualization
        let color = '#22c55e'; // Green for On Track
        
        if (macroName !== 'Calories' && percent > 110) color = '#ef4444'; // Red for Over (Non-Calorie Macros)
        else if (macroName === 'Calories' && percent > 100) color = '#ef4444'; // Red for Over (Calories)
        else if (percent < 90) color = '#f97316'; // Orange for Under
        else if (macroName === 'Calories' && percent > 90) color = '#22c55e'; // Green for On Track (Calories, 90-100)
        else if (percent >= 90 && percent <= 110) color = '#22c55e'; // Green for On Track (Macros, 90-110)


        return { percent, color };
    };

    const macroGoals = {
        Calories: userGoals.energy_kcal,
        Protein: userGoals.protein_g,
        Carbohydrates: userGoals.carbs_g,
        Fat: userGoals.fat_g,
    };

    const summaryCardsData = [
        { name: 'Calories', actual: intakeSummary.Calories, goal: macroGoals.Calories, color: '#FFD700' },
        { name: 'Protein', actual: intakeSummary.Protein, goal: macroGoals.Protein, color: '#38bdf8' },
        { name: 'Carbohydrates', actual: intakeSummary.Carbohydrates, goal: macroGoals.Carbohydrates, color: '#f97316' },
        { name: 'Fat', actual: intakeSummary.Fat, goal: macroGoals.Fat, color: '#FFC0CB' },
    ];
    
    // Overall score calculation (simple average of macro percentages based on goal adherence)
    const goalAdherencePercentages = summaryCardsData.map(item => {
        const { percent } = getMacroStatus(item.name, item.actual, item.goal);
        // Calculate a score based on how close to 100% the adherence is
        // Penalize equally for being under or over (e.g., 90% and 110% both give a 90% adherence score)
        return 100 - Math.abs(100 - percent);
    });

    const totalAdherence = goalAdherencePercentages.reduce((sum, p) => sum + p, 0);
    const overallScore = goalAdherencePercentages.length > 0 ? Math.max(0, Math.round(totalAdherence / goalAdherencePercentages.length)) : 0;
    
    const scoreColor = overallScore >= 90 ? '#22c55e' : (overallScore >= 70 ? '#eab308' : '#ef4444');
    const scoreText = overallScore >= 90 ? 'Excellent' : (overallScore >= 70 ? 'Good' : 'Needs Work');

    return (
        <div style={{ 
            backgroundColor: '#1f1f24', 
            padding: '2rem', 
            borderRadius: '0.75rem', 
            border: '1px solid #3f3f46',
            marginTop: '1rem',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)'
        }}>
            {loading && <p style={{ color: '#a1a1aa' }}>Fetching today's intake data... 🍳</p>}
            {error && <p style={{ color: '#ef4444' }}>Error: {error}</p>}
            
            {!loading && !error && (
                <>
                    {/* --- NUTRITION SCORE REPORT --- */}
                    <h3 style={{ color: '#22c55e', borderBottom: '1px solid #3f3f46', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                        Nutrition Score Report 📈
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1rem', backgroundColor: '#2d2d34', borderRadius: '0.5rem', marginBottom: '2rem' }}>
                        
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ margin: 0, color: '#a1a1aa', fontSize: '1rem' }}>Overall Adherence Score</p>
                            <h4 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: scoreColor }}>
                                {overallScore}%
                            </h4>
                            <p style={{ margin: 0, color: scoreColor, fontWeight: 'bold' }}>{scoreText}</p>
                        </div>

                        {summaryCardsData.map(item => {
                            const status = getMacroStatus(item.name, item.actual, item.goal);
                            return (
                                <div key={item.name} style={{ textAlign: 'center', minWidth: '100px' }}>
                                    <p style={{ margin: 0, color: item.color, fontWeight: 'bold' }}>{item.name}</p>
                                    <p style={{ margin: 0, color: '#fff', fontSize: '1.25rem' }}>{status.percent}%</p>
                                    <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.8rem' }}>Goal: {Math.round(item.goal)}{getUnit(item.name)}</p>
                                </div>
                            );
                        })}
                    </div>


                    {/* --- TODAY'S COOKED RECIPES BREAKDOWN --- */}
                    <h3 style={{ color: '#f97316', borderBottom: '1px solid #3f3f46', paddingBottom: '0.5rem', marginTop: '2rem' }}>
                        Today's Consumed Meals ({todayIntake.length})
                    </h3>
                    
                    {todayIntake.length > 0 ? (
                        <>
                            {/* Summary Totals */}
                            <div style={{ display: 'flex', justifyContent: 'space-around', margin: '1rem 0 2rem 0', padding: '1rem 0', flexWrap: 'wrap', gap: '1rem' }}>
                                {summaryCardsData.map(item => (
                                    <SummaryCard key={item.name} name={`Total ${item.name}`} value={item.actual} color={item.color} />
                                ))}
                            </div>
                            
                            {/* Individual Recipes */}
                            <div className="recipes-intake-list">
                                {todayIntake.map(recipe => (
                                    <RecipeDetail key={recipe._id} recipe={recipe} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <p style={{ color: '#a1a1aa', textAlign: 'center', padding: '1rem' }}>No meals logged today. Log your first meal to see a breakdown! 🥗</p>
                    )}
                </>
            )}
        </div>
    );
};

export default NutritionPlanDetails;