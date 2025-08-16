// server.js
import express from "express";
import fs from "fs";
import PantryItem from "./models/PantryItem.js";

const nutritionApp = express();
nutritionApp.use(express.json());

// Helper: calculate consumed nutrients
function calculateConsumedNutrients(nutrients, pantryItem) {
  if (!pantryItem || pantryItem.consumed === 0) return null;
  const factor = pantryItem.consumed / (pantryItem.quantity || 1);
  const consumedNutrients = {};
  for (const [key, value] of Object.entries(nutrients)) {
    const [numStr, unit] = value.toString().split(" ");
    const num = parseFloat(numStr);
    if (!isNaN(num)) consumedNutrients[key] = `${(num * factor).toFixed(2)} ${unit || ""}`;
    else consumedNutrients[key] = value;
  }
  return consumedNutrients;
}

// Fetch nutrients by barcode
nutritionApp.get("/api/nutrition/:barcode", async (req, res) => {
  const { barcode } = req.params;
  const userId = req.query.userId;

  if (!userId) return res.status(401).json({ error: "Please login" });

  try {
    let nutrients = {};
    let productName = "Unknown Product";

    // Custom JSON fallback
    const customData = JSON.parse(fs.readFileSync("./customProductsWithNutrients.json"));
    if (customData[barcode]) {
      productName = customData[barcode].name;
      nutrients = { ...customData[barcode] };
    }

    // Pantry item for user
    const pantryItem = await PantryItem.findOne({
      userId,
      name: { $regex: new RegExp(productName, "i") },
    });

    res.json({
      source: "Custom JSON",
      name: productName,
      nutrients,
      pantry: pantryItem || null,
      consumedNutrients: calculateConsumedNutrients(nutrients, pantryItem) || {},
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default nutritionApp;
