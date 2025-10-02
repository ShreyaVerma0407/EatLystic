import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ nutrient }) => {
  if (!nutrient) return null;

  const data = {
    labels: ["Protein", "Carbohydrates", "Fat"],
    datasets: [
      {
        label: "Macronutrients (g)",
        data: [nutrient.protein_g, nutrient.carbs_g, nutrient.fat_g],
        backgroundColor: ["#2563eb", "#22c55e", "#facc15"],
        borderColor: ["#1e40af", "#166534", "#a16207"],
        borderWidth: 1,
      },
    ],
  };

  return <Pie data={data} />;
};

export default PieChart;
