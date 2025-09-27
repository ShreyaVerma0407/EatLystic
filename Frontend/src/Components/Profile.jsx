import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Profile() {
  const location = useLocation();
  const navigate = useNavigate();
  const profile = location.state?.profile;
  const nutrient = location.state?.nutrient;

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontWeight: "bold", color: "#ff9000" }}>Your Profile Summary</h1>
      {profile ? (
        <ul>
          {Object.entries(profile).map(([key, value]) => (
            <li key={key} style={{ fontSize: 18 }}>
              <span style={{ color: "#888" }}>{key}:</span> {value}
            </li>
          ))}
        </ul>
      ) : <div>No profile information found.</div>}
      <h2 style={{ marginTop: 32, color: "#ff9000" }}>Your Nutritional Requirements</h2>
      {nutrient ? (
        <ul>
          <li>Calories: {nutrient.energy_kcal} kcal</li>
          <li>Protein: {nutrient.protein_g} g</li>
          <li>Carbs: {nutrient.carbs_g} g</li>
          <li>Fat: {nutrient.fat_g} g</li>
        </ul>
      ) : <div>No nutrient data found.</div>}
      <button
        style={{
          marginTop: 24,
          background: "#ff9000",
          color: "#000",
          fontWeight: 700,
          fontSize: 16,
          padding: "12px 24px",
          borderRadius: 12,
          border: "none",
          cursor: "pointer"
        }}
        onClick={() => navigate("/recipe/macroschef/nutrient", { state: { nutrient } })}
      >
        View Nutrient Details →
      </button>
    </div>
  );
}
