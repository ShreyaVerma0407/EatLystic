import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import "../styles/MacrosDash.css";
import { useNavigate } from "react-router-dom";

// Helper function for nutrition calculation
function evaluateNutrition(answers) {
  let energy_kcal = 2000;
  let protein_g = 50;
  let carbs_g = 250;
  let fat_g = 70;

  switch (answers.activity) {
    case "Sedentary":
      energy_kcal -= 400;
      protein_g -= 10;
      fat_g -= 10;
      break;
    case "Lightly Active":
      energy_kcal -= 150;
      break;
    case "Very Active":
      energy_kcal += 300;
      protein_g += 20;
      fat_g += 10;
      break;
    default:
      break;
  }

  switch (answers.goal) {
    case "Weight Loss":
      energy_kcal -= 500;
      carbs_g -= 50;
      fat_g -= 10;
      break;
    case "Weight Gain":
      energy_kcal += 300;
      protein_g += 10;
      fat_g += 10;
      break;
    case "Muscle Gain":
      energy_kcal += 400;
      protein_g += 25;
      break;
    default:
      break;
  }

  if (answers.ageGroup === "50+ years") {
    protein_g += 5;
  }

  protein_g = Math.max(0, protein_g);
  fat_g = Math.max(0, fat_g);
  carbs_g = Math.max(0, carbs_g);
  energy_kcal = Math.max(0, energy_kcal);

  return { energy_kcal, protein_g, carbs_g, fat_g };
}

const QUESTIONS = [
  { question: "What's your age group?", options: ["18-25 years", "26-35 years", "36-50 years", "50+ years"], key: "ageGroup" },
  { question: "What's your gender?", options: ["Male", "Female", "Other"], key: "gender" },
  { question: "What's your activity level?", options: ["Sedentary", "Lightly Active", "Moderately Active", "Very Active"], key: "activity" },
  { question: "What's your primary health goal?", options: ["Weight Loss", "Weight Gain", "Maintenance", "Muscle Gain"], key: "goal" },
  { question: "Select your height range:", options: ["< 150 cm", "150-165 cm", "166-180 cm", "> 180 cm"], key: "height" },
  { question: "Select your weight range:", options: ["< 50 kg", "50-65 kg", "66-80 kg", "> 80 kg"], key: "weight" },
];

// CSS for the entire component
const style = `
  :root {
    --bg-color: #1a1a1f;
    --card-bg-start: #2a2a30;
    --card-bg-end: #1f1f24;
    --border-color: #3b3b40;
    --text-color: #fff;
    --primary-color: #f97316;
    --primary-color-end: #ea580c;
    --text-secondary: #a1a1aa;
    --black-color: #000;
    --blue-color: #3b82f6;
    --green-color: #22c55e;
    --yellow-color: #eab308;
  }


  body {
    background-color: var(--bg-color);
    font-family: sans-serif;
    color: var(--text-color);
  }


  
  /* BEGIN MODIFICATION: New style for sticky Navbar */
  .sticky-navbar-container {
    position: sticky;
    top: 0;
    z-index: 50; 
    width: 100%;
    background-color: var(--bg-color);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4); 
  }
  /* END MODIFICATION */
  
  .dashboard-card {
    background-image: linear-gradient(to bottom right, var(--card-bg-start), var(--card-bg-end));
    border-radius: 1rem;
    padding: 1.75rem;
    border: 1px solid var(--border-color);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    cursor: pointer;
    transition-property: transform;
    transition-duration: 0.3s;
  }
  .dashboard-card:hover {
    transform: translateY(-0.25rem);
  }
  .dashboard-card .icon-container {
    width: 2.5rem;
    height: 2.5rem;
    background-image: linear-gradient(to bottom right, var(--primary-color), var(--primary-color-end));
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    user-select: none;
  }
  .dashboard-card h3 {
    font-size: 1.25rem;
    font-weight: bold;
    margin: 0;
  }
  .dashboard-card p {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-secondary);
    margin-top: 0.5rem;
  }
  .dashboard-card button {
    background: transparent;
    color: var(--primary-color);
    font-weight: bold;
    font-size: 0.875rem;
    text-align: left;
    padding: 0;
    margin-top: 1rem;
    cursor: pointer;
    border: none;
  }


  @media (min-width: 768px) {
    .dashboard-card .icon-container {
      width: 3rem;
      height: 3rem;
      font-size: 1.5rem;
    }
    .dashboard-card h3 {
      font-size: 1.5rem;
    }
  }


  .primary-button {
    background-image: linear-gradient(to bottom right, var(--primary-color), var(--primary-color-end));
    color: var(--black-color);
    font-weight: bold;
    font-size: 1rem;
    padding: 0.5rem 1rem;
    border-radius: 0.75rem;
    border: none;
    cursor: pointer;
    box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.3), 0 4px 6px -2px rgba(249, 115, 22, 0.3);
    transition: all 0.2s;
  }
  .primary-button:hover {
    transform: scale(1.02);
  }


  .secondary-button {
    background-color: transparent;
    color: var(--primary-color);
    font-weight: bold;
    font-size: 1rem;
    padding: 0.5rem 1rem;
    border-radius: 0.75rem;
    border: 2px solid var(--primary-color);
    cursor: pointer;
    transition: all 0.2s;
  }
  .secondary-button:hover {
    background-color: var(--primary-color);
    color: var(--black-color);
  }


  .message-box {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.55);
    z-index: 2000;
  }
  .message-box-content {
    background-color: var(--card-bg-end);
    padding: 2rem;
    border-radius: 0.75rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border: 1px solid var(--border-color);
    max-width: 24rem;
    text-align: center;
  }
  .message-box-content h3 {
    font-size: 1.25rem;
    font-weight: bold;
    margin-bottom: 1rem;
    color: var(--text-color);
  }
  .message-box-content p {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
  }
  .message-box-content button {
    background-color: var(--primary-color);
    color: var(--black-color);
    font-weight: bold;
    padding: 0.5rem 1.5rem;
    border-radius: 0.5rem;
    transition: background-color 0.2s;
    border: none;
    cursor: pointer;
  }
  .message-box-content button:hover {
    background-color: var(--primary-color-end);
  }


  .quiz-modal {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.55);
    z-index: 1000;
    padding: 1rem;
  }


  .quiz-modal-content {
    background-color: var(--black-color);
    border-radius: 1rem;
    padding: 1.5rem;
    max-width: 32rem;
    width: 100%;
    color: var(--text-color);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    z-index: 10;
  }
  
  @media (min-width: 768px) {
    .quiz-modal-content {
      padding: 2rem;
    }
  }


  .quiz-modal h1 {
    font-weight: bold;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    text-align: center;
  }
  
  @media (min-width: 768px) {
    .quiz-modal h1 {
      font-size: 1.875rem;
    }
  }


  .quiz-modal .subtitle {
    color: var(--text-secondary);
    font-weight: 500;
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
    text-align: center;
  }


  .quiz-modal .progress-info {
    font-size: 0.875rem;
    color: var(--primary-color);
    margin-bottom: 0.75rem;
  }


  .quiz-modal .progress-bar {
    margin-top: 0.25rem;
    height: 0.25rem;
    background-color: #3f3f46;
    border-radius: 9999px;
    width: 100%;
    overflow: hidden;
  }


  .quiz-modal .progress-bar-fill {
    height: 100%;
    background-color: var(--primary-color);
    transition: width 0.3s;
  }


  .quiz-modal h2 {
    font-size: 1.125rem;
    font-weight: bold;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
  
  @media (min-width: 768px) {
    .quiz-modal h2 {
      font-size: 1.25rem;
    }
  }


  .quiz-modal .option-label {
    display: block;
    background-color: #1f2937;
    border-radius: 0.75rem;
    margin-bottom: 0.75rem;
    padding: 0.75rem;
    cursor: pointer;
    transition: all 0.15s;
    border: 2px solid transparent;
    color: var(--text-color);
  }


  .quiz-modal .option-label:hover {
    border-color: #52525b;
  }
  
  .quiz-modal .option-label.selected {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }


  .quiz-modal .option-label input[type="radio"] {
    display: none;
  }


  .quiz-modal button.submit-button {
    margin-top: 1.5rem;
    width: 100%;
    padding: 0.75rem;
    border-radius: 0.75rem;
    font-weight: 800;
    font-size: 1.125rem;
    color: var(--black-color);
    transition: opacity 0.2s;
  }


  .quiz-modal button.submit-button.enabled {
    background-color: var(--primary-color);
    cursor: pointer;
  }


  .quiz-modal button.submit-button.disabled {
    background-color: #4b5563;
    cursor: not-allowed;
    opacity: 0.5;
  }


  .page-container {
    padding: 1.5rem;
    color: var(--text-color);
    min-height: 100vh;
  }
  
  @media (min-width: 768px) {
    .page-container {
      padding: 2.5rem;
    }
  }


  .page-title {
    font-size: 1.875rem;
    font-weight: bold;
    color: var(--primary-color);
    margin-bottom: 1.5rem;
  }
  
  @media (min-width: 768px) {
    .page-title {
      font-size: 2.25rem;
    }
  }


  .profile-grid, .nutrient-grid {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  @media (min-width: 640px) {
    .profile-grid, .nutrient-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }


  @media (min-width: 1024px) {
    .profile-grid, .nutrient-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }


  /* MODIFICATION: Added subtle border and hover effect to profile cards */
  .profile-card, .nutrient-card {
    background-color: var(--card-bg-end);
    padding: 1.5rem;
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border: 4px solid rgba(239, 255, 170, 1); /* Light white border */
    transition: transform 0.3s, box-shadow 0.3s; /* Added box-shadow transition */
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }


  .profile-card:hover, .nutrient-card:hover { /* Updated hover selector */
    transform: scale(1.02);
    box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.2), 0 4px 6px -2px rgba(249, 115, 22, 0.1);
  }


  .profile-card .icon {
    font-size: 2.25rem;
    margin-bottom: 1rem;
  }


  .profile-card h3 {
    font-size: 1.25rem;
    font-weight: bold;
    text-transform: capitalize;
    color: var(--primary-color);
  }


  .profile-card p {
    color: var(--text-secondary);
    font-size: 1.125rem;
    font-weight: 600;
    margin-top: 0.25rem;
  }


  .summary-card {
    background-color: var(--card-bg-end);
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgba(255, 255, 255, 1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border: 1px solid rgb(255,255,255);
    margin-top: 2rem;
  }


  .summary-card h3 {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
    color: var(--primary-color);
  }


  .summary-card p {
    font-size: 1.125rem;
    color: rgb(255,255,255);
    line-height: 1.625;
  }


  .total-calories-card {
    background-color: var(--card-bg-end);
    padding: 2rem;
    border-radius: 4rem;
    box-shadow: 0 4px 6px -1px rgba(255, 255, 255, 1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border: 1px solid rgb(255,255,255);
    margin-bottom: 2rem;
    text-align: center;
  }
  
  .total-calories-card h3 {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: var(--text-secondary);
  }
  
  .total-calories-card p {
    color: var(--text-secondary);
    font-size: 3rem;
    font-weight: 800;
    color: var(--primary-color);
  }
  
  @media (min-width: 768px) {
    .total-calories-card p {
      font-size: 4rem;
    }
  }


  .progress-bar-container {
    position: relative;
    width: 8rem;
    height: 8rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .progress-bar-svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }
  
  .progress-bar-svg circle {
    stroke-width: 10;
    fill: transparent;
  }


  .progress-bar-background {
    stroke: #3f3f46;
  }


  .progress-bar-foreground {
    transition: stroke-dashoffset 0.5s ease-in-out;
    stroke-linecap: round;
  }


  .progress-bar-text {
    position: absolute;
    color: var(--text-color);
    font-weight: bold;
    font-size: 1.25rem;
  }


  .flex-center {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .flex-column-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }


  .text-center {
    text-align: center;
  }


  .mb-16 {
    margin-bottom: 4rem;
  }
  
  .mb-12 {
    margin-bottom: 3rem;
  }
  
  .mb-8 {
    margin-bottom: 2rem;
  }
  
  .mt-8 {
    margin-top: 2rem;
  }
  
  .mt-4 {
    margin-top: 1rem;
  }
  
  .mb-6 {
    margin-bottom: 1.5rem;
  }
  
  .max-w-7xl {
    max-width: 80rem;
    margin-left: auto;
    margin-right: auto;
  }


  .text-transparent {
    color: transparent;
    -webkit-background-clip: text;
    background-clip: text;
  }


  .bg-gradient-to-r {
    background-image: linear-gradient(to right, #fff, var(--primary-color));
  }
  
  .font-extrabold {
    font-weight: 900;
  }
  
  .text-4xl { font-size: 4.25rem; }
  .text-5xl { font-size: 3rem; }
  .text-7xl { font-size: 4.5rem; }
  .text-8xl { font-size: 6rem; }


  @media (min-width: 640px) {
    .text-sm\:text-xl {
      font-size: 1.25rem;
    }
  }


  .font-bold { font-weight: bold; }


  .text-gray-400 { color: #a1a1aa; }
  .max-w-2xl { max-width: 42rem; }
  .mx-auto { margin-left: auto; margin-right: auto; }
  .leading-relaxed { line-height: 1.625; }


  .flex { display: flex; }
  .flex-col { flex-direction: column; }
  .sm\:flex-row {
    flex-direction: column;
  }
  @media (min-width: 640px) {
    .sm\:flex-row {
      flex-direction: row;
    }
  }


  .gap-4 { gap: 1rem; }
  .justify-center { justify-content: center; }
  
  .rounded-3xl {
    border-radius: 1.5rem;
  }


  .shadow-xl {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }


  .p-8 { padding: 2rem; }


  .border { border-width: 1px; }
  .border-gray-700 { border-color: #3f3f46; }


  .text-white { color: var(--text-color); }
  .text-black { color: var(--black-color); }


  .float-right { float: right; }
  .w-full { width: 100%; }
  
  .text-lg { font-size: 1.125rem; }
  .font-extrabold { font-weight: 800; }
  .text-3xl { font-size: 1.875rem; }
  
  /* MODIFICATION: Added utility classes for button sizing */
  .button-group-row {
    display: flex;
    flex-wrap: wrap; /* Allows wrap on smaller screens */
    gap: 1rem;
    justify-content: center;
    max-width: 400px; /* Limit width of button group */
    margin: 0 auto;
  }
  .button-group-row button {
    flex-grow: 1;
    min-width: 150px; /* Ensure buttons don't get too small */
    padding: 0.75rem 1rem;
    text-align: center;
  }
`;


// API base URL for cooked recipes
const API_BASE_URL = "http://localhost:3001/api/recipes/cooked";

const isToday = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// // CircularProgressBar with conic-gradient styling
// const CircularProgressBar = ({ value, unit, label, icon, percentage, color = '#22c55e' }) => {
//   const maxGoal = label === 'Calories' ? 800 : 80;
//   const displayPercentage = percentage || Math.min(100, Math.round((value / maxGoal) * 100));

//   const progressStyle = {
//     position: 'relative',
//     width: '80px',
//     height: '80px',
//     borderRadius: '50%',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     background: `conic-gradient(${color} ${displayPercentage * 3.6}deg, #2d2d34 0deg)`,
//     boxShadow: '0 0 5px rgba(0,0,0,0.5)',
//     transition: 'background 0.5s ease-in-out',
//   };

//   const innerCircleStyle = {
//     position: 'absolute',
//     width: '65px',
//     height: '65px',
//     borderRadius: '50%',
//     backgroundColor: '#1f1f24',
//     display: 'flex',
//     flexDirection: 'column',
//     justifyContent: 'center',
//     alignItems: 'center',
//   };

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', minWidth: '90px', maxWidth: '120px' }}>
//       <div style={progressStyle}>
//         <div style={innerCircleStyle}>
//           <span style={{ fontSize: '1.2rem', color: color }}>{icon}</span>
//           <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '1rem', marginTop: '0.1rem' }}>{displayPercentage}%</span>
//         </div>
//       </div>
//       <p style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 'bold', margin: 0 }}>{label}</p>
//       <p style={{ color: '#a1a1aa', fontSize: '0.8rem', margin: 0 }}>{value}{unit}</p>
//     </div>
//   );
// };

const RecipeCard = ({ recipe }) => {
 const nutritionDetails = recipe.nutritionalContent
  ? Object.entries(recipe.nutritionalContent)
      .filter(([key]) => !key.toLowerCase().includes("fiber")) // exclude fiber keys
      .map(([key, val]) => {
        const unit = key.includes("g") ? "g" : key.includes("kcal") ? "kcal" : "";
        const name = key.replace(/(_g|_kcal)$/i, "");
        return {
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value: parseFloat(val) || 0,
          unit,
        };
      })
  : [];

  const cookedDate = new Date(recipe.cookedAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const cookedTime = new Date(recipe.cookedAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return (
    <div
      className="intake-recipe-card"
      style={{
        backgroundColor: "#1f1f24",
        padding: "1.5rem",
        borderRadius: "0.75rem",
        border: "1.5px solid rgba(255,255,255,1)",
        marginBottom: "1.5rem",
        color: "#fff",
      }}
    >
      <div>
        <h4 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#f97316" }}>{recipe.name}</h4>
        <p>
          Cooked On: <span style={{ color: "#a1a1aa" }}>{cookedDate}</span>
        </p>
        <p>
          Time: <span style={{ color: "#a1a1aa" }}>{cookedTime}</span>
        </p>
      </div>
      <div style={{ marginTop: "1rem" }}>
        <h5 style={{ color: "#22c55e", marginBottom: "0.5rem" }}>Nutritional Information</h5>
        {nutritionDetails.length > 0 ? (
          <ul>
            {nutritionDetails.map((nutrient) => (
              <li key={nutrient.name} style={{ marginBottom: "0.25rem" }}>
                <strong>{nutrient.name}: </strong>
                {nutrient.value} {nutrient.unit}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "#f87171", fontStyle: "italic" }}>No nutritional data available.</p>
        )}
      </div>
    </div>
  );
};


// TodaysIntakeView component to show recipes fetched from API
const TodaysIntakeView = ({ onBack }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 404 && errorData.message.includes("No cooked recipes")) setRecipes([]);
          else throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        } else {
          const data = await response.json();
          const filteredRecipes = (data.data || []).filter(recipe => isToday(recipe.cookedAt));
          setRecipes(filteredRecipes);
        }
      } catch (err) {
        setError("Failed to load recipes. Please check server connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121215', color: '#fff' }}>
      <div className="sticky-navbar-container">
        <Navbar />
      </div>
      <div className="page-container" style={{ padding: '1.5rem', paddingTop: '1rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#f97316', marginBottom: '1.5rem' }}>
          Today's Intake: Consumed Meals 🍽️
        </h1>
        {loading && <p style={{ color: '#a1a1aa' }}>Loading your cooked recipes...</p>}
        {error && <p style={{ color: '#ef4444' }}>Error: {error}</p>}
        {!loading && !error && recipes.length > 0 && (
          <div className="recipes-list">
            {recipes.map(recipe => (<RecipeCard key={recipe._id} recipe={recipe} />))}
          </div>
        )}
        {!loading && !error && recipes.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.75rem', backgroundColor: '#1a1a1f' }}>
            <p style={{ fontSize: '1.25rem', color: '#fff', fontWeight: '500', marginBottom: '1rem' }}>
              ✨ Oops! It seems like no intake has been logged today! ✨<br /><br />
              🍳 Ready to cook up some deliciousness?<br />Let’s get those culinary skills sizzling!
            </p>
          </div>
        )}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            onClick={onBack}
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
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f97316'; e.currentTarget.style.color = '#000'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#f97316'; }}
          >
            ← Go Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

// Dashboard Card component for reuse
function DashboardCard({ icon, title, description, onClick }) {
  return (
    <div
      className="dashboard-card"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="flex-center">
        <div className="icon-container">
          {icon}
        </div>
        <h3>{title}</h3>
      </div>
      <p>{description}</p>
      <button
        onClick={e => { e.stopPropagation(); onClick(); }}
      >
        Explore →
      </button>
    </div>
  );
}
// Main button styles as reusable Tailwind classes
const primaryButtonStyle = "primary-button";
const secondaryButtonStyle = "secondary-button";


// Simple message box component to replace `alert()`
const MessageBox = ({ message, onClose }) => (
  <div className="message-box">
    <div className="message-box-content">
      <h3>Notification</h3>
      <p>{message}</p>
      <button onClick={onClose}>
        OK
      </button>
    </div>
  </div>
);


// Quiz Modal component
const QuizModal = ({ onClose, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const selectOption = (value) => {
    setAnswers((prev) => ({ ...prev, [QUESTIONS[currentIndex].key]: value }));
  };
  const next = () => {
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex((idx) => idx + 1);
    } else {
      const nutrition = evaluateNutrition(answers);
      if (onComplete) onComplete(answers, nutrition);
      onClose();
    }
  };
  const progress = Math.round((currentIndex / (QUESTIONS.length - 1)) * 100);


  return (
    <div className="quiz-modal">
      <div className="quiz-modal-content">
        <h1>
          MacroChef Nutrition Assessment
        </h1>
        <div className="subtitle">
          Help us personalize your nutritional recommendations
        </div>
        <div className="progress-info">
          Question {currentIndex + 1} of {QUESTIONS.length}
          <span style={{ float: 'right', color: '#fff' }}>
            {progress}% complete
          </span>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <h2>{QUESTIONS[currentIndex].question}</h2>
        <div>
          {QUESTIONS[currentIndex].options.map((option) => {
            const selected = answers[QUESTIONS[currentIndex].key] === option;
            return (
              <label
                key={option}
                className={`option-label ${selected ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name={QUESTIONS[currentIndex].key}
                  value={option}
                  checked={selected}
                  onChange={() => selectOption(option)}
                />
                {option}
              </label>
            );
          })}
        </div>
       <button
  disabled={!answers[QUESTIONS[currentIndex].key]}
  className={`submit-button ${answers[QUESTIONS[currentIndex].key] ? "enabled" : "disabled"}`}
  onClick={next}
>
  {currentIndex < QUESTIONS.length - 1 ? "Next" : "Submit"}
</button>


      </div>
    </div>
  );
};


// Profile Summary component
const ProfileSummary = ({ profile, onBack }) => {
  const profileDetails = profile ? Object.entries(profile).map(([key, value]) => {
    let icon = "📊"; // Default icon
    switch (key) {
      case "ageGroup": icon = "🎂"; break;
      case "gender": icon = "🚻"; break;
      case "activity": icon = "🏃"; break;
      case "goal": icon = "🎯"; break;
      case "height": icon = "📏"; break;
      case "weight": icon = "⚖️"; break;
      default: break;
    }
    return { key, value, icon };
  }) : [];


  return (
    <div className="page-container" style={{paddingTop: '1.5rem'}}>
      <h1 className="page-title">Your Profile Summary</h1>
      {profile ? (
        <>
          <div className="profile-grid">
            {profileDetails.map((detail) => (
              <div key={detail.key} className="profile-card">
                <span className="icon">{detail.icon}</span>
                <h3>{detail.key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                <p>{detail.value}</p>
              </div>
            ))}
          </div>
          <div className="summary-card">
            <h3>Summary</h3>
            <p>
              Based on your initial assessment, your profile indicates an individual with a primary goal of <strong>{profile.goal}</strong>. Your current activity level is <strong>{profile.activity}</strong>, which, combined with your age group of <strong>{profile.ageGroup}</strong>, helps to determine your specific nutritional needs. Your body metrics, including a height range of <strong>{profile.height}</strong> and a weight range of <strong>{profile.weight}</strong>, are crucial factors in calculating your personalized macro and calorie requirements for achieving your health goals.
            </p>
          </div>
        </>
      ) : <div style={{ color: '#a1a1aa' }}>No profile information found. Please take the quiz.</div>}
      
      <button
          className={`${secondaryButtonStyle} mt-8`}
          onClick={onBack}
        >
          ← Go Back
      </button>
    </div>
  );
};


// Circular progress bar component for nutrients
const CircularProgressBar = ({ percentage, color }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;


  return (
    <div className="progress-bar-container">
      <svg className="progress-bar-svg" viewBox="0 0 120 120">
        <circle 
          cx="60" 
          cy="60" 
          r={radius} 
          className="progress-bar-background"
          strokeWidth="10" 
          fill="transparent"
        ></circle>
        <circle
          cx="60"
          cy="60"
          r={radius}
          className="progress-bar-foreground"
          strokeWidth="10"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ stroke: `var(--${color})` }}
        ></circle>
      </svg>
      <div className="progress-bar-text">{`${Math.round(percentage)}%`}</div>
    </div>
  );
};


// Nutrient Details component
const NutrientDetails = ({ nutrient, onBack }) => {
  const totalCalories = nutrient ? nutrient.energy_kcal : 0;


  // Calculate percentage of calories from each macro
  const proteinCals = nutrient ? nutrient.protein_g * 4 : 0;
  const carbsCals = nutrient ? nutrient.carbs_g * 4 : 0;
  const fatCals = nutrient ? nutrient.fat_g * 9 : 0;
  
  const proteinPercent = totalCalories > 0 ? (proteinCals / totalCalories) * 100 : 0;
  const carbsPercent = totalCalories > 0 ? (carbsCals / totalCalories) * 100 : 0;
  const fatPercent = totalCalories > 0 ? (fatCals / totalCalories) * 100 : 0;


  const nutrientMacros = [
    { name: "Protein", value: `${nutrient ? nutrient.protein_g : 0} g`, percent: proteinPercent, color: "blue-color", icon: "🍗" },
    { name: "Carbs", value: `${nutrient ? nutrient.carbs_g : 0} g`, percent: carbsPercent, color: "green-color", icon: "🍞" },
    { name: "Fat", value: `${nutrient ? nutrient.fat_g : 0} g`, percent: fatPercent, color: "yellow-color", icon: "🧈" },
  ];


  return (
    <div className="page-container" style={{paddingTop: '1.5rem'}}>
      <h1 className="page-title">Your Daily Nutritional Requirements</h1>
      {nutrient ? (
        <>
          <div className="total-calories-card">
            <h3>Total Daily Calories</h3>
            <p>{nutrient.energy_kcal} kcal</p>
          </div>
          <div className="nutrient-grid">
            {nutrientMacros.map((macro) => (
              <div key={macro.name} className="nutrient-card flex-column-center">
                <span style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>{macro.icon}</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', textTransform: 'capitalize', marginBottom: '1rem' }}>{macro.name}</h3>
                <CircularProgressBar percentage={macro.percent} color={macro.color} />
                <p style={{ color: '#a1a1aa', fontSize: '1.125rem', fontWeight: '600', marginTop: '1rem' }}>{macro.value}</p>
              </div>
            ))}
          </div>
          <div className="summary-card">
            <h3>Understanding Your Plan</h3>
            <p>
              Your personalized nutrition plan is designed to help you meet your primary health goals. Your daily calorie intake is <strong>{nutrient.energy_kcal} kcal</strong>. This is divided into <strong>{nutrient.protein_g} grams</strong> of protein, <strong>{nutrient.carbs_g} grams</strong> of carbohydrates, and <strong>{nutrient.fat_g} grams</strong> of fat. Following these guidelines will provide your body with the necessary energy and nutrients to support your specific objectives, whether it's weight management, muscle growth, or maintaining a healthy lifestyle.
            </p>
          </div>
        </>
      ) : (
        <div style={{ color: '#a1a1aa' }}>No nutrient data was found.</div>
      )}
      <button
          className={`${secondaryButtonStyle} mt-8`}
          onClick={onBack}
        >
          ← Go Back
      </button>
    </div>
  );
};


// Your QuizModal, ProfileSummary, NutrientDetails, MessageBox components
// should remain unchanged and be copied from your existing code.

const App = () => {
  const navigate = useNavigate();

  // App states
  const [route, setRoute] = useState("dashboard");
  const [profile, setProfile] = useState(null);
  const [nutrient, setNutrient] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showNutritionPlan, setShowNutritionPlan] = useState(false);  // Manage cooked recipes view

  useEffect(() => {
    document.body.className = "bg-color font-sans";
    return () => { document.body.className = ""; };
  }, []);

  const handleQuizComplete = (answers, nutrition) => {
    setProfile(answers);
    setNutrient(nutrition);
    setRoute("dashboard");
  };

  const navigateToProfile = () => profile ? setRoute("profile") : setShowQuiz(true);
  const navigateToNutritionAnalysis = () => nutrient ? setRoute("nutrient") : setShowQuiz(true);

  const showNutritionPlanFeature = () => setShowNutritionPlan(true);
  const handleBackFromIntake = () => setShowNutritionPlan(false);

  const handleDownloadClick = () => setShowMessage(true);

  const renderContent = () => {
    if (showNutritionPlan) {
      return <TodaysIntakeView onBack={handleBackFromIntake} />;
    }
    switch (route) {
      case "dashboard":
        return (
          <div>
            <div className="sticky-navbar-container">
              <Navbar />
            </div>
            <div className="page-container" style={{ paddingTop: '0' }}>
              <div className="max-w-7xl mx-auto p-6 md:p-10">
                <div className="text-center mb-16">
                  <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold mb-3 leading-tight bg-clip-text text-transparent bg-gradient-to-r">
                    Welcome to Your Nutrition Hub
                  </h1>
                  <p className="text-lg sm:text-xl font-bold text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    Your personalized nutrition dashboard is ready! Explore each section to optimize your health journey.
                  </p>
                </div>
                <div className="text-center mb-12">
                  <button onClick={() => setShowQuiz(true)} className="primary-button">
                    Set Your Profile with Rapid Quiz
                  </button>
                </div>
                <div className="profile-grid">
                  <DashboardCard
                    icon="👤"
                    title="Your Profile"
                    description="Details from your initial assessment"
                    onClick={navigateToProfile}
                  />
                  <DashboardCard
                    icon="🍽️"
                    title="Your Nutrition Plan"
                    description="See all meals logged today with nutritional breakdown."
                    onClick={showNutritionPlanFeature}
                  />
                  <DashboardCard
                    icon="📈"
                    title="Today's Intake"
                    description="Monitor consumed meals and nutritional breakdown"
                    onClick={() => navigate("/recipe/macroschef/intake")}
                  />
                  <DashboardCard
                    icon="⭐"
                    title="NutriScore Report"
                    description="Comprehensive nutrition analysis with actionable insights"
                    onClick={navigateToNutritionAnalysis}
                  />
                  <DashboardCard
                    icon="🍲"
                    title="Recommended Recipes"
                    description="Personalized meal suggestions to meet your nutritional goals"
                    onClick={() => navigate("/recipe/macroschef/recommendrecipe")}
                  />
                </div>
                <div className="bg-gradient-to-br from-[#2a2a30] to-[#1f1f24] rounded-3xl p-8 border border-gray-700 shadow-xl text-center">
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#fff' }}>
                    Quick Actions
                  </h3>
                  <div className="button-group-row">
                    <button onClick={() => setShowQuiz(true)} className="primary-button">
                      Retake Quiz
                    </button>
                    <button onClick={handleDownloadClick} className="secondary-button">
                      Download Full Report
                    </button>
                  </div>
                </div>
              </div>
              {showQuiz && <QuizModal onClose={() => setShowQuiz(false)} onComplete={handleQuizComplete} />}
              {showMessage && <MessageBox message="Download functionality not yet implemented." onClose={() => setShowMessage(false)} />}
            </div>
          </div>
        );
      case "profile":
        return (
          <div>
            <div className="sticky-navbar-container">
              <Navbar />
            </div>
            <ProfileSummary profile={profile} onBack={() => setRoute("dashboard")} />
          </div>
        );
      case "nutrient":
        return (
          <div>
            <div className="sticky-navbar-container">
              <Navbar />
            </div>
            <NutrientDetails nutrient={nutrient} onBack={() => setRoute("dashboard")} />
          </div>
        );
      default:
        return <div>404 Page Not Found</div>;
    }
  };

  return (
    <>
      <style>{style}</style>
      {renderContent()}
    </>
  );
};

export default App;
