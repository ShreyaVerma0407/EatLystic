import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pie, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import "../styles/NutrientPage.css";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const NutrientPage = () => {
  const [pantryItems, setPantryItems] = useState([]);
  const [selectedBarcode, setSelectedBarcode] = useState("");
  const [manualName, setManualName] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [nutritionData, setNutritionData] = useState(null);
  const [error, setError] = useState("");

  const userId = localStorage.getItem("userId");

  // Fetch pantry items
  useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:3001/api/pantry/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") setPantryItems(data.data);
      })
      .catch((err) => console.error("Error fetching pantry items", err));
  }, [userId]);

  // Fetch nutrition by barcode
  const fetchNutritionByBarcode = async (barcode) => {
    if (!barcode) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/nutrition/${barcode}?userId=${userId}`
      );
      setNutritionData(res.data);
      setError("");
      setShowManualInput(false);
    } catch (err) {
      setError(err.response?.data?.error || "Error fetching nutrients");
      if (err.response?.data?.needsName) setShowManualInput(true);
      setNutritionData(null);
    }
  };

  // Fetch nutrition by manual name
  const fetchNutritionByName = async () => {
    if (!manualName) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/nutrition/by-name?name=${encodeURIComponent(
          manualName
        )}&userId=${userId}`
      );
      setNutritionData(res.data);
      setError("");
      setShowManualInput(false);
    } catch (err) {
      setError(err.response?.data?.error || "Error fetching nutrients by name");
      setNutritionData(null);
    }
  };

  // Nutrient icons & colors
  const nutrientStyles = {
    sugar: { color: "#FF4D4D", icon: "🍬" },
    protein: { color: "#32CD32", icon: "🥩" },
    fat: { color: "#FFA500", icon: "🧈" },
    fiber: { color: "#1E90FF", icon: "🥗" },
    carb: { color: "#9932CC", icon: "🍞" },
    default: { color: "#A9A9A9", icon: "🍽️" },
  };

  // Chart Data
  const chartData = nutritionData
    ? {
        labels: Object.keys(nutritionData.nutrients).filter(
          (key) => key.toLowerCase() !== "calories" && key.toLowerCase() !== "energy"
        ),
        datasets: [
          {
            label: "Consumed",
            data: Object.entries(nutritionData.nutrients)
              .filter(
                ([key]) =>
                  key.toLowerCase() !== "calories" && key.toLowerCase() !== "energy"
              )
              .map(([key, value]) => {
                const consumedAmount =
                  nutritionData.pantry?.[key]?.consumed ||
                  nutritionData.pantry?.consumed ||
                  0;
                return parseFloat(value) * consumedAmount;
              }),
            backgroundColor: Object.entries(nutritionData.nutrients).map(
              ([key]) => {
                key = key.toLowerCase();
                if (key.includes("sugar")) return nutrientStyles.sugar.color;
                else if (key.includes("protein")) return nutrientStyles.protein.color;
                else if (key.includes("fat")) return nutrientStyles.fat.color;
                else if (key.includes("fiber")) return nutrientStyles.fiber.color;
                else if (key.includes("carb")) return nutrientStyles.carb.color;
                else return nutrientStyles.default.color;
              }
            ),
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => `${tooltipItem.raw.toFixed(2)} g`,
        },
      },
    },
  };

  return (
    <div className="nutrient-page-wrapper">
      <div className="wave-bg"></div>

      <div className="nutrient-card">
        <h1 className="gradient-text">Nutrient Analyzer</h1>
        <p>Scan barcode or select pantry item</p>

        {/* Barcode / Manual Input */}
        <div className="nutrient-form">
          <div>
            <input
              type="text"
              placeholder="Enter Barcode"
              value={selectedBarcode}
              onChange={(e) => setSelectedBarcode(e.target.value)}
            />
            <button onClick={() => fetchNutritionByBarcode(selectedBarcode)}>
              Get Nutrients
            </button>
          </div>

          {showManualInput && (
            <div>
              <input
                type="text"
                placeholder="Enter Product Name"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
              />
              <button onClick={fetchNutritionByName}>Fetch Nutrients</button>
            </div>
          )}

          {error && <p className="error-text">{error}</p>}
        </div>

        {/* Pantry Items */}
        <div style={{ marginTop: "1.5rem" }}>
          <h3>Pantry Items</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {pantryItems.length === 0 && <p>No items in pantry.</p>}
            {pantryItems.map((item) => (
              <button
                key={item._id}
                onClick={() => fetchNutritionByBarcode(item._id)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "12px",
                  border: "none",
                  background: "#ff914d",
                  color: "white",
                  cursor: "pointer",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                }}
              >
                {item.name} (Qty: {item.quantity})
              </button>
            ))}
          </div>
        </div>

        {/* Nutrition Data */}
        {nutritionData && (
          <div className="results-container">
            <h2 className="gradient-text">{nutritionData.name}</h2>
            <p>Source: {nutritionData.source}</p>

            {/* Nutrient Cards with Progress */}
            <div className="nutrient-grid">
              {Object.entries(nutritionData.nutrients)
                .filter(
                  ([key]) =>
                    key.toLowerCase() !== "calories" && key.toLowerCase() !== "energy"
                )
                .map(([key, value]) => {
                  const lowerKey = key.toLowerCase();
                  const style =
                    lowerKey.includes("sugar")
                      ? nutrientStyles.sugar
                      : lowerKey.includes("protein")
                      ? nutrientStyles.protein
                      : lowerKey.includes("fat")
                      ? nutrientStyles.fat
                      : lowerKey.includes("fiber")
                      ? nutrientStyles.fiber
                      : lowerKey.includes("carb")
                      ? nutrientStyles.carb
                      : nutrientStyles.default;

                  const consumedAmount =
                    nutritionData.pantry?.[key]?.consumed ||
                    nutritionData.pantry?.consumed ||
                    0;
                  const consumedValue = parseFloat(value) * consumedAmount;
                  const percentage = ((consumedValue / parseFloat(value)) * 100).toFixed(1);

                  return (
                    <div key={key} className="nutrient-card-ui">
                      <span className="nutrient-icon">{style.icon}</span>
                      <h4>{key}</h4>
                      <p>
                        {consumedValue.toFixed(2)} / {parseFloat(value).toFixed(2)}
                      </p>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${percentage}%`, background: style.color }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Charts */}
            {chartData && (
              <div className="charts-wrapper">
                <div className="chart-side">
                  <Doughnut data={chartData} options={chartOptions} />
                </div>
                <div className="chart-side">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </div>
            )}

            {nutritionData.pantry && <p>Already in Pantry: Yes</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default NutrientPage;
