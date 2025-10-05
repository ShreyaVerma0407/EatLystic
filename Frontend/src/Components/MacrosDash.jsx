import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import "../styles/MacrosDash.css";
import Footer from './Footer';
import { useNavigate } from "react-router-dom";


// Helper function to evaluate daily nutritional requirements
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
// Styling for the new table and status tags
const style = `
  :root {
    /* Base colors for table progress bars (kept the same) */
    --blue-color: #3b82f6; 
    --green-color: #22c55e;
    --yellow-color: #f59e0b;
    --red-color: #ef4444;

    /* Chart Colors - Macro (Green) */
    --green-light: #4ade80; /* Consumed */
    --green-dark: #16a34a; /* Recommended */

    /* Chart Colors - Energy (Redownlaod) */
    --red-light: #f87171; /* Consumed */
    --red-dark: #dc2626; /* Recommended */
  }
  
  /* --- STICKY NAVBAR STYLES --- */
  .sticky-navbar-container {
    position: sticky;
    top: 0;
    z-index: 1000; 
    background-color: #121215; 
    border-bottom: 1px solid #1f1f24; 
    width: 100%;
  }
/* -------------------------------------------
   --- Nutrition Table Styles (Specificity Increased) ---
   ------------------------------------------- */

/* Targeting the element with a high-specificity selector if possible,
   but mainly ensuring variable consistency. */
.nutrition-comparison-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 12px; /* Increased spacing for visibility */
    color: var(--text-primary) !important; /* Force text color */
    font-size: 1rem;
    margin-top: 20px;
}
 
/* Increased specificity by listing the table class before the element */
.nutrition-comparison-table th, 
.nutrition-comparison-table td {
    padding: 1rem;
    text-align: left;
    /* Use the theme's divider color */
    border-bottom: 1px solid var(--divider-color); 
}

/* Table Header Styles */
.nutrition-comparison-table th {
    background-color: var(--card-bg-color) !important; /* Force dark background */
    font-weight: bold;
    color: var(--text-secondary) !important; /* Force lighter header text */
    text-transform: uppercase;
    font-size: 0.875rem;
    letter-spacing: 0.05em;
    /* Ensure no residual background color bleeds through */
    border-top: 1px solid var(--card-bg-color); 
}

/* Table Body Row Styles */
.nutrition-comparison-table tbody tr {
    /* Use theme's card background, forced */
    background-color: var(--card-bg-color) !important; 
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4); /* Stronger shadow for definition */
    transition: background-color 0.2s;
}
 
.nutrition-comparison-table tbody tr:hover {
    /* Use a slightly different dark color for hover contrast */
    background-color: #38383e !important; 
}

/* First column (label) styles */
.nutrition-comparison-table tbody td:first-child {
    font-weight: bold;
    color: var(--accent-color) !important; /* Force orange accent color */
    /* Add border-radius here to contain the row's background */
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
}

/* Last column cell to complete the border-radius */
.nutrition-comparison-table tbody td:last-child {
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
}

/* Remove bottom border on the last row cells for a clean separation */
.nutrition-comparison-table tbody tr:last-child td {
    border-bottom: none !important;
}
  /* Status Tags */
  .status-tag {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-weight: bold;
    font-size: 0.875rem;
  }

  .status-low {
    background-color: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    border: 1px solid #ef4444;
  }

  .status-high {
    background-color: rgba(245, 158, 11, 0.2);
    color: #f59e0b;
    border: 1px solid #f59e0b;
  }

  .status-normal {
    background-color: rgba(34, 197, 94, 0.2);
    color: #22c55e;
    border: 1px solid #22c55e;
  }

  /* Progress Bar in Table */
  .progress-cell {
      display: flex;
      align-items: center;
      gap: 10px;
  }
  
  .progress-bar-small {
    height: 8px;
    width: 100px;
    background-color: #3f3f46;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .progress-bar-fill-small {
    height: 100%;
    transition: width 0.5s ease-in-out;
  }

  /* Summary boxes above table */
  .nutrient-status-summary > div {
    font-size: 1.25rem;
  }
  
  /* --- VERTICAL BAR CHART STYLES --- */
  .vertical-bar-chart-container {
      background-color: #1a1a1f;
      padding: 2rem;
      border-radius: 0.75rem;
      margin-top: 2rem; 
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  }
  
  .chart-main-title {
      font-size: 1.5rem;
      font-weight: bold;
      color: #fff;
      margin-bottom: 1.5rem;
      text-align: center;
  }

  /* Local legend styling */
  .chart-legend-local {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 1rem;
      color: #ccc;
      font-size: 0.8rem;
      font-weight: 500;
  }

  .legend-item {
      display: flex;
      align-items: center;
  }

  .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 3px;
      margin-right: 0.3rem;
  }

  /* Legend color definitions */
  .legend-color.red-dark-box { background-color: var(--red-dark); }
  .legend-color.red-light-box { background-color: var(--red-light); }
  .legend-color.green-dark-box { background-color: var(--green-dark); }
  .legend-color.green-light-box { background-color: var(--green-light); }


  .chart-groups-wrapper {
      display: flex;
      justify-content: space-around;
      gap: 3rem;
  }

  .chart-group {
      flex: 1;
      min-width: 45%; 
      padding: 1rem; /* Added padding to make separation clearer */
      border: 1px solid #2a2a30; /* Added a subtle border for separation */
      border-radius: 8px;
  }

  .chart-title {
      font-size: 1.2rem;
      color: #f97316;
      margin-bottom: 1rem;
      text-align: center;
      font-weight: 600;
  }

  .vertical-bar-chart-grid {
      display: grid;
      grid-template-columns: 50px 1fr; /* Y-axis width and Bars container */
      height: 300px;
      position: relative;
      border-bottom: 1px solid #555; /* X-axis line */
  }

  /* Y-Axis Styling */
  .y-axis {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      padding-bottom: 0.2rem; 
      font-size: 0.8rem;
      color: #a1a1aa;
      text-align: right;
  }

  .y-tick {
      position: relative;
  }

  /* Grid lines are now only visible in the macro group */
  .macro-group .y-grid-line {
      position: absolute;
      top: 50%;
      right: 0;
      width: 100vw; 
      height: 1px;
      background-color: #2a2a30;
      z-index: 0;
  }

  /* Hide grid lines for the Energy chart */
  .calories-group .y-tick .y-grid-line {
      display: none;
  }

  /* Bars Container */
  .bars-container {
      display: flex;
      justify-content: space-around;
      gap: 1.5rem;
      padding-top: 1px; 
  }

  .bar-set-container {
      width: 100px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end; 
  }
  
  .bar-set {
      display: flex;
      height: 100%;
      align-items: flex-end;
      gap: 4px;
      width: 100%;
      justify-content: center;
      position: relative;
      padding-bottom: 20px; 
  }

  .vertical-bar {
      width: 25px;
      min-height: 1px; 
      transition: height 0.5s ease-out;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      position: relative;
      cursor: pointer;
  }

  /* Bar color assignments: Dark = Recommended, Light = Consumed */
  
  /* Energy Group (Red) */
  .calories-group .recommended-bar { background-color: var(--red-dark); }
  .calories-group .consumed-bar { background-color: var(--red-light); }
  
  /* Macronutrient group (Green) */
  .macro-group .recommended-bar { background-color: var(--green-dark); } 
  .macro-group .consumed-bar { background-color: var(--green-light); } 


  /* X-Axis Labels */
  .x-axis-label {
      text-align: center;
      font-size: 0.9rem;
      color: #fff;
      margin-top: 5px;
      width: 100%;
  }

  /* Tooltip for hover effect */
  .vertical-bar::after {
      content: attr(data-tooltip);
      position: absolute;
      bottom: 100%; 
      left: 50%;
      transform: translateX(-50%) translateY(-5px);
      background-color: #333;
      color: #fff;
      padding: 5px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      white-space: nowrap;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s, visibility 0.3s;
      z-index: 10;
      pointer-events: none; 
  }

  .vertical-bar:hover::after {
      opacity: 1;
      visibility: visible;
  }
`;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const COOKED_RECIPES_URL = `${API_BASE_URL}/recipes/cooked`;


const isToday = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};


const CircularProgressBar = ({ percentage, color }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const clampedPercentage = Math.max(0, Math.min(100, percentage)); // Clamp between 0 and 100
  const offset = circumference - (clampedPercentage / 100) * circumference;

  return (
    <div className="progress-bar-container">
      <svg className="progress-bar-svg" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} className="progress-bar-background" strokeWidth="10" fill="transparent"></circle>
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
      <div className="progress-bar-text">{`${Math.round(clampedPercentage)}%`}</div>
    </div>
  );
};

// --- UPDATED VerticalBarChart Component ---
const VerticalBarChart = ({ comparisonData }) => {
    // Determine the maximum value across all recommended and consumed data points
    let maxKcal = 0;
    let maxMacro = 0;

    comparisonData.forEach(item => {
        if (item.name === 'Calories') {
            maxKcal = Math.max(maxKcal, item.recommendedValue, item.consumedValue);
        } else {
            maxMacro = Math.max(maxMacro, item.recommendedValue, item.consumedValue);
        }
    });

    // Use a 20% buffer on the max value for better scaling and round up
    const getMaxScale = (name) => {
        const maxValue = name === 'Calories' ? maxKcal : maxMacro;
        if (name === 'Calories') {
             return Math.ceil(maxValue * 1.2 / 100) * 100;
        }
        return Math.ceil(maxValue * 1.2 / 10) * 10;
    };
    
    // Y-Axis tick generator: generates 5 labels + 0 (6 ticks total)
    const getYTicks = (name) => {
        const maxScale = getMaxScale(name);
        const step = maxScale / 5;
        const ticks = [];
        for (let i = 0; i <= 5; i++) {
            ticks.push(i * step);
        }
        return ticks;
    };

    // Split data into Calories and Macros for separate Y-scales
    const caloriesData = comparisonData.filter(d => d.name === 'Calories');
    const macroData = comparisonData.filter(d => d.name !== 'Calories');
    
    // Determine the colors based on the type of nutrient group
    const getBarColors = (name) => {
        // Red for Energy/Calories: Dark Red for Recommended, Light Red for Consumed
        if (name === 'Calories') {
            return { recommended: 'red-dark', consumed: 'red-light', recommendedBox: 'red-dark-box', consumedBox: 'red-light-box' };
        } 
        // Green for Macros: Dark Green for Recommended, Light Green for Consumed
        return { recommended: 'green-dark', consumed: 'green-light', recommendedBox: 'green-dark-box', consumedBox: 'green-light-box' };
    };

    const renderChartGroup = (groupData) => {
        if (!groupData || groupData.length === 0) return null;
        
        const isCaloriesGroup = groupData[0].name === 'Calories';
        const yTicks = getYTicks(groupData[0].name);
        const maxScale = getMaxScale(groupData[0].name);
        const colors = getBarColors(groupData[0].name);

        return (
            <div className={`chart-group ${isCaloriesGroup ? 'calories-group' : 'macro-group'}`}>
                <h4 className="chart-title">{isCaloriesGroup ? 'Energy (kcal)' : 'Macronutrients (g)'}</h4>
                
                {/* Local Legend for this specific chart group */}
                <div className="chart-legend-local">
                    <span className="legend-item">
                        <span className={`legend-color ${colors.recommendedBox}`}></span> Recommended
                    </span>
                    <span className="legend-item">
                        <span className={`legend-color ${colors.consumedBox}`}></span> Consumed
                    </span>
                </div>

                <div className="vertical-bar-chart-grid">
                    {/* Y-Axis */}
                    <div className="y-axis">
                        {/* Reverse ticks for display (highest at top) */}
                        {yTicks.slice().reverse().map((tick, index) => (
                            <div key={index} className="y-tick">
                                {Math.round(tick)}
                                {/* Hide grid lines for Calories group */}
                                {index < 5 && !isCaloriesGroup && <div className="y-grid-line"></div>}
                            </div>
                        ))}
                    </div>

                    {/* Bars Container */}
                    <div className="bars-container">
                        {groupData.map((item) => {
                            return (
                                <div key={item.name} className="bar-set-container">
                                    <div className="bar-set">
                                        {/* Recommended Bar - Darker Color */}
                                        <div 
                                            className={`vertical-bar recommended-bar bg-${colors.recommended}`} 
                                            style={{ height: `${(item.recommendedValue / maxScale) * 100}%` }}
                                            data-tooltip={`Recommended ${item.name}: ${item.recommendedValue.toFixed(0)} ${item.unit}`}
                                        >
                                        </div>
                                        
                                        {/* Consumed Bar - Lighter Color */}
                                        <div 
                                            className={`vertical-bar consumed-bar bg-${colors.consumed}`} 
                                            style={{ height: `${(item.consumedValue / maxScale) * 100}%` }}
                                            data-tooltip={`Consumed ${item.name}: ${item.consumedValue.toFixed(1)} ${item.unit}`}
                                        >
                                        </div>
                                    </div>
                                    <div className="x-axis-label">{item.name}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="vertical-bar-chart-container">
            <h3 className="chart-main-title">Nutrient Consumption Comparison 📊</h3>
            
            {/* Removed the central legend and replaced it with local legends in renderChartGroup */}

            <div className="chart-groups-wrapper">
                {caloriesData.length > 0 && renderChartGroup(caloriesData)}
                {macroData.length > 0 && renderChartGroup(macroData)}
            </div>
            
        </div>
    );
};
// --- END VerticalBarChart Component ---


// New Component for the comparison table
const NutritionComparisonTable = ({ recommended, consumed, onBack }) => {
  const dataKeys = ['energy_kcal', 'protein_g', 'carbs_g', 'fat_g'];
  const dataLabels = {
    // Note: The 'color' key here refers to the table's progress bar color, not the chart bar color
    energy_kcal: { name: 'Calories', unit: 'kcal', color: 'red-color' },
    protein_g: { name: 'Protein', unit: 'g', color: 'blue-color' },
    carbs_g: { name: 'Carbohydrates', unit: 'g', color: 'green-color' },
    fat_g: { name: 'Fat', unit: 'g', color: 'yellow-color' },
  };

  // Safely parse float values with fallback
  const getSafeValue = (obj, key) => {
    const val = obj && obj[key];
    return typeof val === 'number' ? val : parseFloat(val) || 0;
  };

  const comparisonData = dataKeys.map(key => {
    const consumedValue = getSafeValue(consumed, key);
    const recommendedValue = getSafeValue(recommended, key);
    const difference = recommendedValue - consumedValue;
    const progressPercent = recommendedValue > 0 ? (consumedValue / recommendedValue) * 100 : 0;

    let status, analysis;

    if (difference > 0) {
      status = 'Low';
      analysis = `Need ${difference.toFixed(1)} more ${dataLabels[key].unit}`;
    } else if (difference < 0) {
      const tolerance = key === 'energy_kcal' ? 0 : recommendedValue * 0.10;
      if (Math.abs(difference) <= tolerance) {
        status = 'Normal';
        analysis = `Target achieved`;
      } else {
        status = 'High';
        analysis = `${Math.abs(difference).toFixed(1)} ${dataLabels[key].unit} excess`;
      }
    } else {
      status = 'Normal';
      analysis = 'Target achieved';
    }

    const progressDisplay = Math.min(100, Math.max(0, progressPercent));

    return {
      name: dataLabels[key].name,
      recommended: `${recommendedValue.toFixed(0)} ${dataLabels[key].unit}`,
      consumed: `${consumedValue.toFixed(1)} ${dataLabels[key].unit}`,
      progressPercent,
      progressDisplay,
      status,
      analysis,
      color: dataLabels[key].color,
      // Data for VerticalBarChart
      recommendedValue: recommendedValue,
      consumedValue: consumedValue,
      unit: dataLabels[key].unit,
    };
  });

  // Count nutrients by status for summary
  const countLow = comparisonData.filter(item => item.status === 'Low').length;
  const countNormal = comparisonData.filter(item => item.status === 'Normal').length;
  const countHigh = comparisonData.filter(item => item.status === 'High').length;
  const totalNutrients = comparisonData.length;

  return (
    <div style={{ marginTop: '2rem', marginBottom: '2rem', overflowX: 'auto' }}>
      
      {/* Summary divs for statuses, displayed above the table */}
      <div className="nutrient-status-summary" style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="status-box" style={{ backgroundColor: '#1f1f24', color: '#f97316', flex: 1, padding: '1rem', borderRadius: '0.75rem', textAlign: 'center', fontWeight: 'bold' }}>
          Total Nutrients<br />{totalNutrients}
        </div>
        <div className="status-box" style={{ backgroundColor: '#1f1f24', color: '#f59e0b', flex: 1, padding: '1rem', borderRadius: '0.75rem', textAlign: 'center', fontWeight: 'bold' }}>
          Above Target<br />{countHigh}
        </div>
        <div className="status-box" style={{ backgroundColor: '#1f1f24', color: '#22c55e', flex: 1, padding: '1rem', borderRadius: '0.75rem', textAlign: 'center', fontWeight: 'bold' }}>
          On Target<br />{countNormal}
        </div>
        
        <div className="status-box" style={{ backgroundColor: '#1f1f24', color: '#ef4444', flex: 1, padding: '1rem', borderRadius: '0.75rem', textAlign: 'center', fontWeight: 'bold' }}>
          Below Target<br />{countLow}
        </div>
      </div>

      <h2 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#d19f1fff', marginBottom: '1.5rem' }}>
        Nutritional Plan
      </h2>
      <table className="nutrition-comparison-table">
        <thead>
          <tr>
            <th>Nutrient</th>
            <th>Recommended</th>
            <th>Consumed</th>
            <th>Progress</th>
            <th>Status</th>
            <th>Analysis</th>
          </tr>
        </thead>
        <tbody>
          {comparisonData.map(item => (
            <tr key={item.name}>
              <td>{item.name}</td>
              <td>{item.recommended}</td>
              <td>{item.consumed}</td>
              <td>
                <div className="progress-cell">
                  <div className="progress-bar-small">
                    <div
                      className="progress-bar-fill-small"
                      style={{
                        width: `${item.progressDisplay}%`,
                        backgroundColor: `var(--${item.color})`,
                      }}
                    />
                  </div>
                  <span>{`${item.progressPercent.toFixed(0)}%`}</span>
                </div>
              </td>
              <td>
                <span className={`status-tag status-${item.status.toLowerCase().replace(' ', '-')}`}>
                  {item.status}
                </span>
              </td>
              <td>{item.analysis}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* VERTICAL BAR CHART MOVED HERE - Below the table */}
      <VerticalBarChart comparisonData={comparisonData} />
      {/* END VERTICAL BAR CHART */}
  {/* ✅ Go Back Button here */}
    <button
          onClick={onBack}
          style={{
            padding: "0.55rem 1.3rem",
            background: "transparent",
            color: "#f97316",
            border: "2px solid #f97316",
            borderRadius: "0.75rem",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background-color 0.2s, color 0.2s",
            display: "block",
            margin: "2.3em auto 0 0",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f97316";
            e.currentTarget.style.color = "#000";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#f97316";
          }}
        >
          ← Go Back to Dashboard
        </button>
    </div>
  );
};


const NutrientDetails = ({ nutrient }) => {
  const totalCalories = nutrient ? nutrient.energy_kcal : 0;

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

  if (!nutrient) {
    return (
      <div style={{ marginTop: '2rem', color: '#a1a1aa' }}>
        No nutrient data was found.
      </div>
    );
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <h1 className="page-title">Macro Distribution Report</h1>
      <div className="total-calories-card">
        <h3>Total Daily Recommended Calories</h3>
        <p>{nutrient.energy_kcal} kcal</p>
      </div>
      <div className="nutrient-grid">
        {nutrientMacros.map((macro) => (
          <div key={macro.name} className="nutrient-card flex-column-center">
            <span style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>{macro.icon}</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', textTransform: 'capitalize', marginBottom: '1rem' }}>
              {macro.name}
            </h3>
            <CircularProgressBar percentage={macro.percent} color={macro.color} />
            <p style={{ color: '#a1a1aa', fontSize: '1.125rem', fontWeight: '600', marginTop: '1rem' }}>{macro.value}</p>
          </div>
        ))}
      </div>
      <div className="summary-card">
        <h3>Understanding Your Plan</h3>
        <p>
          Your personalized nutrition plan is designed to help you meet your primary health goals. Your daily calorie intake is{" "}
          <strong>{nutrient.energy_kcal} kcal</strong>. This is divided into <strong>{nutrient.protein_g} grams</strong> of protein,{" "}
          <strong>{nutrient.carbs_g} grams</strong> of carbohydrates, and <strong>{nutrient.fat_g} grams</strong> of fat. Following these guidelines will provide
          your body with the necessary energy and nutrients to support your specific objectives, whether it's weight management, muscle growth, or maintaining a
          healthy lifestyle.
        </p>
      </div>

    </div>
  );
};


// Refactored CombinedNutritionPlanView to handle fetching and macro calculation
const CombinedNutritionPlanView = ({ nutrient, onBack }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [consumedTotals, setConsumedTotals] = useState({ energy_kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });

  const calculateTodaysIntakeTotals = (recipes) => {
    let totalKcal = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    const todayRecipes = recipes.filter(recipe => isToday(recipe.cookedAt));

    todayRecipes.forEach(recipe => {
        const content = recipe.nutritionalContent || {};
        
        // Map DB keys to local total variables.
        // DB keys: calories, protein_g, carbohydrates_g, fat_g
        
        totalKcal += parseFloat(content.calories) || 0; // Use 'calories' key from DB
        totalProtein += parseFloat(content.protein_g) || 0;
        totalCarbs += parseFloat(content.carbohydrates_g) || 0; // Use 'carbohydrates_g' key from DB
        totalFat += parseFloat(content.fat_g) || 0;
    });

    setRecipes(todayRecipes);
    setConsumedTotals({
        energy_kcal: totalKcal, // Map totalKcal to the expected 'energy_kcal'
        protein_g: totalProtein,
        carbs_g: totalCarbs, // Map totalCarbs to the expected 'carbs_g'
        fat_g: totalFat
    });
  };

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch(COOKED_RECIPES_URL);
        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 404 && errorData.message.includes("No cooked recipes")) {
            calculateTodaysIntakeTotals([]); // Still calculate with empty array
          } else {
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
          }
        } else {
          const data = await response.json();
          calculateTodaysIntakeTotals(data.data || []);
        }
      } catch (err) {
        setError("Failed to load recipes. Please check server connection.");
        calculateTodaysIntakeTotals([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  return (
    <div className="page-container" style={{ minHeight: '100vh', backgroundColor: '#121215', color: '#fff', paddingBottom: '3rem' }}>
      
      {/* Navbar handled in App renderContent for sticking */}

      <div style={{paddingTop: '2rem'}}>
        {/* Nutritional Comparison Table and VerticalBarChart */}
       <NutritionComparisonTable
  recommended={nutrient}
  consumed={consumedTotals}
  onBack={onBack}
/>

        {/* TodaysIntakeView component is intentionally removed */}
      </div>
    </div>
  );
};


const DashboardCard = ({ icon, title, description, onClick }) => {
  return (
    <div className="dashboard-card" onClick={onClick} style={{ cursor: "pointer" }}>
      <div className="flex-center">
        <div className="icon-container">{icon}</div>
        <h3>{title}</h3>
        </div>
      <p>{description}</p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        Explore →
      </button>
    </div>
  );
};


const primaryButtonStyle = "primary-button";
const secondaryButtonStyle = "secondary-button";


const MessageBox = ({ message, onClose }) => (
  <div className="message-box">
    <div className="message-box-content">
      <h3>Notification</h3>
      <p>{message}</p>
      <button onClick={onClose}>OK</button>
      </div>
  </div>
);


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
        <h1>MacroChef Nutrition Assessment</h1>
        <div className="subtitle">Help us personalize your nutritional recommendations</div>
        <div className="progress-info">
          Question {currentIndex + 1} of {QUESTIONS.length}
          <span style={{ float: "right", color: "#fff" }}>{progress}% complete</span>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <h2>{QUESTIONS[currentIndex].question}</h2>
        <div>
          {QUESTIONS[currentIndex].options.map((option) => {
            const selected = answers[QUESTIONS[currentIndex].key] === option;
            return (
              <label key={option} className={`option-label ${selected ? "selected" : ""}`}>
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
const ProfileSummary = ({ profile, onBack }) => {
  const profileDetails = profile
    ? Object.entries(profile).map(([key, value]) => {
        let icon = "📊";
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
      })
    : [];

  const [hovered, setHovered] = useState(false);

  const formatKey = (key) =>
    key.replace(/([A-Z])/g, " $1").trim().replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div
      className="page-container"
      style={{
        minHeight: "100vh",
        backgroundColor: "#121215",
        color: "#fff",
        paddingBottom: "3rem",
        paddingTop: "2rem",
      }}
    >
      <div
        className="profile-main-card"
        style={{
          maxWidth: 900, // increased width for larger container
          margin: "3rem auto",
          border: hovered ? "2.5px solid #f97316" : "1.5px solid #f97316",
          borderRadius: "1.1rem",
          background: hovered ? "#23232a" : "#18181b",
          boxShadow: hovered
            ? "0 10px 32px #f973161c"
            : "0 5px 20px #0006",
          padding: "2.6rem 3rem 2.1rem 3rem",
          transition: "box-shadow 0.2s, border 0.22s, background 0.19s",
          cursor: "pointer",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <h1
          style={{
            marginBottom: "0.2em",
            textAlign: "center",
            fontSize: "2.3rem",
            fontWeight: "bold",
            color: "#f97316"
          }}
        >
          Your Profile Summary 👤
        </h1>
        <p
          style={{
            marginTop: "0.3em",
            marginBottom: "2.3em",
            fontWeight: 600,
            color: "#d4d4d8",
            textAlign: "center",
          }}
        >
          These are the details used to calculate your personalized nutrition plan.
        </p>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "0 0.65rem",
          }}
        >
          <tbody>
            {profileDetails.map((item) => (
              <tr
                key={item.key}
                style={{
                  background: "#1f1f24",
                  borderRadius: "0.6em",
                  overflow: "hidden",
                }}
              >
                <td
                  style={{
                    padding: "0.66em 0.6em",
                    color: "#a855f7",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    width: 180,
                    verticalAlign: "middle",
                    border: "none",
                    whiteSpace: "nowrap"
                  }}
                >
                  <span style={{ marginRight: 8 }}>{item.icon}</span>
                  {formatKey(item.key)}
                </td>
                <td
                  style={{
                    textAlign: "left",
                    padding: "0.66em 12px",
                    fontSize: "1.2rem",
                    color: "#f3f3f3",
                    fontWeight: "bold",
                    border: "none",
                    verticalAlign: "middle",
                    wordBreak: "break-word"
                  }}
                >
                  {item.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
      </div>
      <button
          onClick={onBack}
          style={{
            padding: "0.55rem 1.3rem",
            background: "transparent",
            color: "#f97316",
            border: "2px solid #f97316",
            borderRadius: "0.75rem",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background-color 0.2s, color 0.2s",
            display: "block",
            margin: "2.3em auto 0 0",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f97316";
            e.currentTarget.style.color = "#000";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#f97316";
          }}
        >
          ← Go Back to Dashboard
        </button>
    </div>
  );
};


const App = () => {
  const navigate = useNavigate();

  const [route, setRoute] = useState("dashboard");
  const [profile, setProfile] = useState(null);
  const [nutrient, setNutrient] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showNutritionPlan, setShowNutritionPlan] = useState(false);

  useEffect(() => {
    document.body.className = "bg-color font-sans";
    return () => {
      document.body.className = "";
    };
  }, []);

  const handleQuizComplete = (answers, nutrition) => {
    setProfile(answers);
    setNutrient(nutrition);
    setRoute("dashboard");
  };

  const navigateToProfile = () => (profile ? setRoute("profile") : setShowQuiz(true));
  const navigateToNutritionAnalysis = () => (nutrient ? setRoute("nutrient") : setShowQuiz(true));

  const showNutritionPlanFeature = () => {
    if (!nutrient || Object.keys(nutrient).length === 0) {
      setShowQuiz(true);
    } else {
      setShowNutritionPlan(true);
    }
  };

  const handleBackFromIntake = () => setShowNutritionPlan(false);

  const handleNutritionalPlanClick = async () => {
  if (nutrient && Object.keys(nutrient).length > 0) {
    setRoute("nutrient");
  } else {
    // If nutrient data missing, open the quiz first
    setShowQuiz(true);
  }
};

  const renderContent = () => {
    // Check if the current view is one that uses the combined view
    if (showNutritionPlan) {
      return (
        <>
          <div className="sticky-navbar-container">
            <Navbar />
          </div>
          {/* CombinedNutritionPlanView now contains the table and the improved vertical bar chart */}
          <CombinedNutritionPlanView nutrient={nutrient} onBack={handleBackFromIntake} />
       
        </>
      );
    }
    
    // For other routes, render Navbar inside a sticky container
    switch (route) {
      case "dashboard":
        return (
          <>
            <div className="sticky-navbar-container">
              <Navbar />
            </div>
            <div className="page-container" style={{ paddingTop: 0 }}>
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
                  <button onClick={() => setShowQuiz(true)} className={primaryButtonStyle}>
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
                    icon="⭐"
                    title="NutriScore Report"
                    description="Comprehensive nutrition analysis with actionable insights"
                    onClick={navigateToNutritionAnalysis}
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
                    icon="🍲"
                    title="Recommended Recipes"
                    description="Personalized meal suggestions to meet your nutritional goals"
                    onClick={() => navigate("/recipe/macroschef/recipe")}
                  />
                </div>
                <div className="bg-gradient-to-br from-[#2a2a30] to-[#1f1f24] rounded-3xl p-8 border border-gray-700 shadow-xl text-center">
                  <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem", color: "#fff" }}>
                    Quick Actions
                  </h3>
                  <div className="button-group-row">
                    <button onClick={() => setShowQuiz(true)} className={primaryButtonStyle}>
                      Retake Quiz
                    </button>
                    <button
  onClick={showNutritionPlanFeature}
  className={secondaryButtonStyle}
  style={{ marginLeft: '10px' }} // move slightly left
>
  Nutritional Plan
</button>

                  </div>
                </div>
              </div>
              {showQuiz && <QuizModal onClose={() => setShowQuiz(false)} onComplete={handleQuizComplete} />}
              {showMessage && (
                <MessageBox message="Download functionality not yet implemented." onClose={() => setShowMessage(false)} />
              )}
            </div>
          </>
        );
      case "profile":
        return (
          <>
            <div className="sticky-navbar-container">
              <Navbar />
            </div>
            <ProfileSummary profile={profile} onBack={() => setRoute("dashboard")} />
          </>
        );
      case "nutrient":
        return (
          <>
            <div className="sticky-navbar-container">
              <Navbar />
            </div>
            <div className="page-container">
     <NutrientDetails nutrient={nutrient} />
              <button className={`${secondaryButtonStyle} mt-8`} onClick={() => setRoute("dashboard")}>
                ← Go Back
              </button>

            </div>
          </>
        );
      default:
        return <div>404 Page Not Found</div>;
    }
  };

  return (
    <>
      <style>{style}</style>
      {renderContent()}
      <Footer/>
    </>
  );
};

export default App;