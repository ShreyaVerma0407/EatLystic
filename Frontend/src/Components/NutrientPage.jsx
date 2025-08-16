import React, { useState } from "react";
import axios from "axios";
import { Pie, Bar } from "react-chartjs-2";
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

export default function NutrientPage() {
  const [barcode, setBarcode] = useState("");
  const [manualName, setManualName] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [productData, setProductData] = useState(null);
  const [error, setError] = useState("");

  const userId = localStorage.getItem("userId");

  const handleFetchByBarcode = async () => {
    if (!userId) return (window.location.href = "/login");
    try {
      const res = await axios.get(
        `http://localhost:5000/api/nutrition/${barcode}?userId=${userId}`
      );
      setProductData(res.data);
      setError("");
      setShowManualInput(false);
    } catch (err) {
      setError(err.response?.data?.error || "Error fetching nutrients");
      if (err.response?.data?.needsName) setShowManualInput(true);
      setProductData(null);
    }
  };

  const handleFetchByName = async () => {
    if (!userId) return (window.location.href = "/login");
    if (!manualName) return;

    try {
      const res = await axios.get(
        `http://localhost:5000/api/nutrition/by-name?name=${encodeURIComponent(
          manualName
        )}&userId=${userId}`
      );
      setProductData(res.data);
      setError("");
      setShowManualInput(false);
    } catch (err) {
      setError(err.response?.data?.error || "Error fetching nutrients by name");
      setProductData(null);
    }
  };

  // Pastel colors for nutrients
  const nutrientColors = {
  sugar: "#FF7F7F",   // darker pink
  protein: "#7FFF9F", // stronger mint green
  fat: "#FFB870",     // richer pastel orange
  fiber: "#7FBFFF",   // medium pastel blue
  carb: "#B870FF",    // deeper lavender
  default: "#D9D9D9", // soft gray, still light
};


  // Chart data
  const chartData = productData
    ? {
        labels: Object.keys(productData.nutrients).filter(
          (key) => key.toLowerCase() !== "calories" && key.toLowerCase() !== "energy"
        ),
        datasets: [
          {
            label: "Nutrients",
            data: Object.entries(productData.nutrients)
              .filter(
                ([key]) => key.toLowerCase() !== "calories" && key.toLowerCase() !== "energy"
              )
              .map(([_, value]) => parseFloat(value)),
            backgroundColor: Object.entries(productData.nutrients)
              .filter(
                ([key]) => key.toLowerCase() !== "calories" && key.toLowerCase() !== "energy"
              )
              .map(([key]) => {
                key = key.toLowerCase();
                if (key.includes("sugar")) return nutrientColors.sugar;
                else if (key.includes("protein")) return nutrientColors.protein;
                else if (key.includes("fat")) return nutrientColors.fat;
                else if (key.includes("fiber")) return nutrientColors.fiber;
                else if (key.includes("carb")) return nutrientColors.carb;
                else return nutrientColors.default;
              }),
            borderColor: "#fff",
            borderWidth: 2,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    animation: { duration: 800, easing: "easeOutQuart" },
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.raw}`;
          },
        },
      },
    },
  };

  return (
    <div className="nutrient-page-wrapper">
      <div className="wave-bg"></div>

      <div className="nutrient-card">
        <h1>Nutrient Analyzer</h1>
        <p>Scan barcode or enter product name</p>

        <div className="nutrient-form">
          <div>
            <input
              type="text"
              placeholder="Enter Barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
            />
            <button onClick={handleFetchByBarcode}>Get Nutrients</button>
          </div>

          {showManualInput && (
            <div>
              <input
                type="text"
                placeholder="Enter Product Name"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
              />
              <button onClick={handleFetchByName}>Fetch Nutrients</button>
            </div>
          )}

          {error && <p className="error-text">{error}</p>}
        </div>

        {productData && (
          <div className="results-container">
            <h2 className="gradient-text">{productData.name}</h2>
            <p>Source: {productData.source}</p>

            {/* Legend */}
            <div className="nutrient-legend">
              <div><span className="legend-color" style={{background: nutrientColors.sugar}}></span>Sugar</div>
              <div><span className="legend-color" style={{background: nutrientColors.protein}}></span>Protein</div>
              <div><span className="legend-color" style={{background: nutrientColors.fat}}></span>Fat</div>
              <div><span className="legend-color" style={{background: nutrientColors.fiber}}></span>Fiber</div>
              <div><span className="legend-color" style={{background: nutrientColors.carb}}></span>Carbs</div>
              <div><span className="legend-color" style={{background: nutrientColors.default}}></span>Normal</div>
            </div>

            {/* Nutrient Boxes */}
            <div className="nutrient-boxes-horizontal">
              {Object.entries(productData.nutrients)
                .filter(([key]) => key.toLowerCase() !== "calories" && key.toLowerCase() !== "energy")
                .map(([key, value]) => {
                  const lowerKey = key.toLowerCase();
                  let boxColor = nutrientColors.default;
                  if (lowerKey.includes("sugar")) boxColor = nutrientColors.sugar;
                  else if (lowerKey.includes("protein")) boxColor = nutrientColors.protein;
                  else if (lowerKey.includes("fat")) boxColor = nutrientColors.fat;
                  else if (lowerKey.includes("fiber")) boxColor = nutrientColors.fiber;
                  else if (lowerKey.includes("carb")) boxColor = nutrientColors.carb;

                  return (
                    <div key={key} className="nutrient-box" style={{ background: boxColor }}>
                      <strong>{key}</strong>
                      <p>{value}</p>
                    </div>
                  );
                })}
            </div>

            {/* Charts side by side */}
            {chartData && (
              <div className="charts-wrapper">
                <div className="chart-side">
                  <Pie data={chartData} options={chartOptions} />
                </div>
                <div className="chart-side">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </div>
            )}

            {productData.pantry && <p>Already in Pantry: Yes</p>}
          </div>
        )}
      </div>
    </div>
  );
}

