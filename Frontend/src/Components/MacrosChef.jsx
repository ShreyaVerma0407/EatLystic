import React, { useState, useMemo } from "react";
import recipesData from "../data/recipe.json";

const QUESTIONS = [
  {
    question: "Choose your meal type:",
    options: ["Breakfast", "Lunch", "Snacks", "Beverages", "Dinner"],
    key: "mealType",
  },
  {
    question: "What’s your goal for this meal?",
    options: ["Weight loss", "Weight gain", "Maintenance"],
    key: "goal",
  },
  {
    question: "How important is protein in your meal?",
    options: ["Low", "Medium", "High"],
    key: "proteinImportance",
  },
  {
    question: "Would you like to keep the fat content?",
    options: ["Low", "Moderate", "High"],
    key: "fatContent",
  },
  {
    question: "Select your height range:",
    options: ["< 150 cm", "150-165 cm", "166-180 cm", "> 180 cm"],
    key: "height",
  },
  {
    question: "Select your weight range:",
    options: ["< 50 kg", "50-65 kg", "66-80 kg", "> 80 kg"],
    key: "weight",
  },
];

const subtleOrange = "#cc6600";

const nutritionEstimates = {
  mealType: {
    Breakfast: { calories: 170, protein_g: 6, carbohydrates_g: 15, fat_g: 10, fiber_g: 4 },
    Lunch: { calories: 290, protein_g: 15, carbohydrates_g: 25, fat_g: 12, fiber_g: 5 },
    Snacks: { calories: 110, protein_g: 3, carbohydrates_g: 10, fat_g: 6, fiber_g: 2 },
    Beverages: { calories: 80, protein_g: 0, carbohydrates_g: 20, fat_g: 0, fiber_g: 1 },
    Dinner: { calories: 300, protein_g: 12, carbohydrates_g: 20, fat_g: 15, fiber_g: 4 },
  },
  goal: {
    "Weight loss": { calories: -50, protein_g: 1, fat_g: -4, carbohydrates_g: -3 },
    "Weight gain": { calories: 80, protein_g: 3, fat_g: 4, carbohydrates_g: 5 },
    Maintenance: {},
  },
  proteinImportance: {
    Low: { calories: -30, protein_g: -2 },
    Medium: {},
    High: { calories: 40, protein_g: 3 },
  },
  fatContent: {
    Low: { calories: -40, fat_g: -5 },
    Moderate: {},
    High: { calories: 50, fat_g: 5 },
  },
  height: {
    "< 150 cm": { calories: -20 },
    "150-165 cm": { calories: 0 },
    "166-180 cm": { calories: 15 },
    "> 180 cm": { calories: 30 },
  },
  weight: {
    "< 50 kg": { calories: -15 },
    "50-65 kg": { calories: 0 },
    "66-80 kg": { calories: 10 },
    "> 80 kg": { calories: 20 },
  },
};

const colors = {
  calories: "#ff8a65",
  protein_g: "#80cbc4",
  carbohydrates_g: "#ffab91",
  fat_g: "#ffcc80",
  fiber_g: "#aed581",
};

const boldBorder = {
  calories: "#ff5722",
  protein_g: "#26a69a",
  carbohydrates_g: "#ff7043",
  fat_g: "#ffa726",
  fiber_g: "#7cb342",
};

export default function Macroschef() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [disabled, setDisabled] = useState(true);
  const [showResult, setShowResult] = useState(false);

  const onOptionChange = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setDisabled(false);
  };

  const goNext = () => {
    setDisabled(true);
    if (currentIndex + 1 < QUESTIONS.length) setCurrentIndex(currentIndex + 1);
    else setShowResult(true);
  };

  const calcNutrition = () => {
    const base = nutritionEstimates.mealType[answers.mealType] || {};
    const goal = nutritionEstimates.goal[answers.goal] || {};
    const proteinImp = nutritionEstimates.proteinImportance[answers.proteinImportance] || {};
    const fatCont = nutritionEstimates.fatContent[answers.fatContent] || {};
    const heightC = nutritionEstimates.height[answers.height] || {};
    const weightC = nutritionEstimates.weight[answers.weight] || {};

    const sum = (key) =>
      (base[key] || 0) +
      (goal[key] || 0) +
      (proteinImp[key] || 0) +
      (fatCont[key] || 0) +
      (heightC[key] || 0) +
      (weightC[key] || 0);

    return {
      calories: Math.max(0, sum("calories")),
      protein_g: Math.max(0, sum("protein_g")),
      carbohydrates_g: Math.max(0, sum("carbohydrates_g")),
      fat_g: Math.max(0, sum("fat_g")),
      fiber_g: Math.max(0, sum("fiber_g")),
    };
  };

  const recipeArray = useMemo(() => {
    if (Array.isArray(recipesData)) return recipesData;
    if (recipesData && Array.isArray(recipesData.recipes)) return recipesData.recipes;
    return Object.values(recipesData);
  }, []);

  const isNutritionNearby = (recipeNut, targetNut, rangePercent = 20) => {
    const keys = ["calories", "protein_g", "carbohydrates_g", "fat_g", "fiber_g"];
    return keys.every((key) => {
      const recVal = (recipeNut?.[key] ?? recipeNut?.[key.replace("calories", "energy_kcal")]) || 0;
      const tarVal = targetNut[key] || 0;
      if (tarVal === 0) return true; 
      const lowerBound = tarVal * (1 - rangePercent / 100);
      const upperBound = tarVal * (1 + rangePercent / 100);
      return recVal >= lowerBound && recVal <= upperBound;
    });
  };

  const matchedRecipes = useMemo(() => {
    if (!showResult) return [];

    const targetNut = calcNutrition();

    return recipeArray.filter((recipe) => {
      if (!recipe.category || !answers.mealType) return false;
      if (recipe.category.toLowerCase() !== answers.mealType.toLowerCase()) return false;
      if (!recipe.nutrition) return false;

      return isNutritionNearby(recipe.nutrition, targetNut);
    });
  }, [answers, showResult, recipeArray]);

  const circleStyle = (bgColor, borderColor) => ({
    backgroundColor: bgColor,
    borderTopColor: borderColor,
    borderRightColor: borderColor,
    borderBottomColor: borderColor,
    borderLeftColor: borderColor,
    borderStyle: "solid",
    borderWidth: 5,
    borderRadius: "50%",
    width: 120,
    height: 120,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: `0 0 10px ${borderColor}`,
    color: "#000",
    fontWeight: "bold",
    fontSize: 24,
    textAlign: "center",
    userSelect: "none",
    padding: 10,
  });

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: showResult ? "#000" : "#444",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "40px 20px 60px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    header: {
      fontSize: 36,
      fontWeight: "900",
      marginBottom: 8,
      userSelect: "none",
      letterSpacing: "0.1em",
    },
    subtitle: {
      fontSize: 16,
      marginBottom: 30,
      maxWidth: 480,
      textAlign: "center",
      fontWeight: "400",
      lineHeight: 1.4,
      userSelect: "none",
    },
    heading: {
      fontSize: 22,
      fontWeight: "bold",
      marginBottom: 20,
      borderBottom: `3px solid ${subtleOrange}`,
      paddingBottom: 8,
      width: "fit-content",
      userSelect: "none",
    },
    card: {
      backgroundColor: "#222",
      borderRadius: 15,
      padding: 28,
      width: 400,
      maxWidth: "90vw",
      boxShadow: `0 0 10px ${subtleOrange}80`,
      marginBottom: 20,
      opacity: disabled ? 0.9 : 1,
      transition: "opacity 0.3s ease",
    },
    question: {
      margin: 0,
      fontSize: 20,
      fontWeight: "600",
      marginBottom: 20,
      borderLeft: `5px solid ${subtleOrange}`,
      paddingLeft: 12,
    },
    options: {
      display: "flex",
      flexDirection: "column",
      gap: 14,
      marginBottom: 20,
    },
    label: {
      backgroundColor: "#333",
      borderRadius: 8,
      padding: "12px 18px",
      cursor: "pointer",
      color: "#fff",
      fontWeight: "500",
      fontSize: 16,
      userSelect: "none",
      border: "2px solid transparent",
      transition: "background-color 0.3s ease, border 0.3s ease",
    },
    labelChecked: {
      backgroundColor: subtleOrange,
      borderColor: "#fff",
      color: "#000",
      fontWeight: "700",
    },
    radioInput: { display: "none" },
    button: {
      backgroundColor: subtleOrange,
      border: "none",
      borderRadius: 12,
      padding: "14px 36px",
      fontWeight: "700",
      fontSize: 16,
      cursor: disabled ? "default" : "pointer",
      color: disabled ? "#555" : "#000",
      transition: "background-color 0.3s ease",
      opacity: disabled ? 0.6 : 1,
      alignSelf: "center",
      userSelect: "none",
    },
    neonContainer: {
      display: "flex",
      gap: 28,
      marginBottom: 30,
      flexWrap: "wrap",
      justifyContent: "center",
    },
    resultContainer: {
      display: "flex",
      flexWrap: "wrap",
      gap: 20,
      justifyContent: "center",
      maxWidth: 900,
      width: "100%",
    },
    recipeCard: {
      backgroundColor: "#333",
      borderRadius: 15,
      padding: 20,
      width: 320,
      color: "#fff",
      boxShadow: `0 0 15px ${subtleOrange}aa`,
      display: "flex",
      flexDirection: "column",
      gap: 12,
    },
    recipeTitle: {
      fontSize: 20,
      fontWeight: "bold",
    },
    nutritionInfo: {
      fontSize: 14,
      color: "#ccc",
      lineHeight: 1.3,
    },
    recipeImage: {
      width: "100%",
      height: 180,
      objectFit: "cover",
      borderRadius: 12,
    },
  };

  if (showResult) {
    const targetNutrition = calcNutrition();

    return (
      <div style={styles.container}>
        <div style={styles.neonContainer} aria-label="Your nutritional requirements" role="region">
          {Object.entries(targetNutrition).map(([key, value]) => (
            <div key={key} style={circleStyle(colors[key], boldBorder[key])} title={key}>
              <div style={{ flex: 1, wordWrap: "break-word" }}>{value.toFixed(1)}</div>
              <div style={{ marginTop: 6, fontSize: 14, userSelect: "none" }}>
                {key === "calories" ? "kcal" : key.replace("_g", "").replace("_", " ")}
              </div>
            </div>
          ))}
        </div>

        <h2 style={styles.heading}>Recipes Nearby Your Nutritional Content</h2>
        {matchedRecipes.length === 0 && <p>No recipes found matching your nutritional range.</p>}
        <div style={styles.resultContainer}>
          {matchedRecipes.map((recipe) => (
            <div key={recipe.id || recipe.name} style={styles.recipeCard}>
              {recipe.image && <img src={"/" + recipe.image} alt={recipe.name} style={styles.recipeImage} />}
              <div style={styles.recipeTitle}>{recipe.name}</div>
              <div style={styles.nutritionInfo}>
                Calories: {(recipe.nutrition?.calories ?? recipe.nutrition?.energy_kcal) || "N/A"} kcal<br/>
                Protein: {recipe.nutrition?.protein_g || "N/A"} g<br/>
                Carbs: {(recipe.nutrition?.carbohydrates_g ?? recipe.nutrition?.carbs_g) || "N/A"} g<br/>
                Fat: {recipe.nutrition?.fat_g || "N/A"} g<br/>
                Fiber: {recipe.nutrition?.fiber_g || "N/A"} g
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>MacrosChef</h1>
      <p style={styles.subtitle}>Please answer the questions below to get recipe suggestions.</p>
      <div style={styles.heading}>Set Your Preferences</div>
      <div style={styles.card}>
        <h2 style={styles.question}>{QUESTIONS[currentIndex].question}</h2>
        <div style={styles.options}>
          {QUESTIONS[currentIndex].options.map((opt) => {
            const selected = answers[QUESTIONS[currentIndex].key] === opt;
            return (
              <label key={opt} style={{ ...styles.label, ...(selected ? styles.labelChecked : {}) }}>
                <input
                  type="radio"
                  name={QUESTIONS[currentIndex].key}
                  value={opt}
                  checked={selected}
                  style={styles.radioInput}
                  onChange={() => onOptionChange(QUESTIONS[currentIndex].key, opt)}
                />
                {opt}
              </label>
            );
          })}
        </div>
        <button disabled={disabled} style={styles.button} onClick={goNext}>
          {currentIndex === QUESTIONS.length - 1 ? "Submit" : "Next"}
        </button>
      </div>
    </div>
  );
}
