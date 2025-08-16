import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import PantryItem from "./models/PantryItem.js";
import cors from "cors";
import fs from "fs";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const USDA_API_KEY = process.env.USDA_API_KEY;
const CUSTOM_JSON_FILE = "./customProductsWithNutrients.json";

if (!USDA_API_KEY) console.warn("⚠️ USDA API key not found in .env");

// --------------------
// Middleware to check login
// --------------------
function requireLogin(req, res, next) {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(401).json({ error: "Please login to view nutrient page" });
  }
  req.userId = userId;
  next();
}

// --------------------
// Helper: Extract nutrients from USDA response
// --------------------
function extractNutrients(food) {
  const nutrients = {};
  (food.foodNutrients || []).forEach(n => {
    const name = n.nutrientName || n.nutrient?.name;
    const value = n.value || n.amount;
    const unit = n.unitName || n.nutrient?.unitName;
    if (name && value) nutrients[name] = `${value} ${unit || ""}`;
  });
  return nutrients;
}

// --------------------
// Fetch USDA nutrients by name
// --------------------
async function fetchUSDA(name) {
  if (!USDA_API_KEY) return null;

  try {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(
      name
    )}&api_key=${USDA_API_KEY}&pageSize=5`;

    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.foods || data.foods.length === 0) return null;

    const food =
      data.foods.find(f =>
        f.description.toLowerCase().includes(name.toLowerCase())
      ) || data.foods[0];

    return extractNutrients(food);
  } catch (err) {
    console.error("USDA fetch error:", err.message);
    return null;
  }
}

// --------------------
// Fetch nutrients by barcode
// --------------------
app.get("/api/nutrition/:barcode", requireLogin, async (req, res) => {
  const { barcode } = req.params;
  const userId = req.userId;

  try {
    let productName = null;
    let nutrients = null;

    // Step 1: Try OpenFoodFacts
    const offRes = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const offData = await offRes.json();

    if (offData.status === 1 && offData.product.product_name) {
      productName = offData.product.product_name;
      nutrients = {
        ...offData.product.nutriments // Keep OpenFoodFacts nutrients if available
      };
    } else {
      // Step 2: Try Custom JSON
      const customData = JSON.parse(fs.readFileSync(CUSTOM_JSON_FILE));
      if (customData[barcode]) {
        productName = customData[barcode].name;
        nutrients = { ...customData[barcode] };
      } else {
        return res.status(404).json({ error: "Product not found in OpenFoodFacts or Custom JSON" });
      }
    }

    // Step 3: Fetch missing nutrients from USDA
    if (USDA_API_KEY) {
      const usdaData = await fetchUSDA(productName);
      if (usdaData) {
        nutrients = { ...usdaData, ...nutrients }; // keep existing values
      }
    }

    // Step 4: Check pantry
    let pantryItem = null;
    if (userId) {
      pantryItem = await PantryItem.findOne({
        userId,
        name: { $regex: new RegExp(productName, "i") }
      });
    }

    res.json({
      source: "OpenFoodFacts + USDA + Custom JSON",
      name: productName,
      nutrients,
      pantry: pantryItem || null
    });
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// --------------------
// Fetch nutrients by product name
// --------------------
app.get("/api/nutrition/by-name", requireLogin, async (req, res) => {
  const { name } = req.query;
  const userId = req.userId;

  if (!name) return res.status(400).json({ error: "Product name required" });

  try {
    // Step 1: Check Custom JSON first
    const customData = JSON.parse(fs.readFileSync(CUSTOM_JSON_FILE));
    let nutrients = Object.values(customData).find(p => p.name.toLowerCase() === name.toLowerCase()) || null;
    nutrients = nutrients ? { ...nutrients } : null;

    // Step 2: USDA fallback
    if (!nutrients && USDA_API_KEY) {
      const usdaData = await fetchUSDA(name);
      nutrients = usdaData || null;
    }

    if (!nutrients) return res.status(404).json({ error: "Product not found" });

    // Step 3: Check pantry
    let pantryItem = null;
    if (userId) {
      pantryItem = await PantryItem.findOne({
        userId,
        name: { $regex: new RegExp(name, "i") }
      });
    }

    res.json({
      source: "USDA + Custom JSON",
      name,
      nutrients,
      pantry: pantryItem || null
    });
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default app;
