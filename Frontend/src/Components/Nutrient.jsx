import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Nutrient() {
  const location = useLocation();
  const nutrient = location.state?.nutrient;

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontWeight: "bold", color: "#ff9000" }}>Your Daily Nutritional Requirements</h1>
      {nutrient ? (
        <ul>
          <li>Calories: {nutrient.energy_kcal} kcal</li>
          <li>Protein: {nutrient.protein_g} g</li>
          <li>Carbs: {nutrient.carbs_g} g</li>
          <li>Fat: {nutrient.fat_g} g</li>
        </ul>
      ) : (
        <div>No nutrient data was found.</div>
      )}
    </div>
  );
}
