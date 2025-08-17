// server/routes/calorieRoutes.js
import express from "express";
import axios from "axios";
import Calorie from "../models/Calorie.js";

const calorieRouter = express.Router();

const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID || "d8fcef32";
const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY || "cce36e3d448f77400622c1ec62a5b3b7";

// GET /api/calorie?item=xxx - fetch calories from DB or Edamam API and auto-save if fetched from API
calorieRouter.get("/", async (req, res) => {
  const { item } = req.query;
  if (!item) return res.status(400).json({ status: "error", message: "Item query required" });

  try {
    // First check if calorie info exists in your DB
    let calorieDoc = await Calorie.findOne({ name: item });
    if (calorieDoc) {
      return res.json({ status: "success", calories: calorieDoc.calories });
    }

    // If not in DB, fetch from Edamam API
    const response = await axios.get("https://api.edamam.com/api/food-database/v2/parser", {
      params: {
        ingr: item,
        app_id: EDAMAM_APP_ID,
        app_key: EDAMAM_APP_KEY,
      },
    });

    let calories = 0;
    let imageUrl = "";
    let category = "";

    if (response.data.parsed?.length > 0) {
      calories = response.data.parsed[0].food.nutrients.ENERC_KCAL || 0;
      imageUrl = response.data.parsed[0].food.image || "";
      category = response.data.parsed[0].food.category || "";
    } else if (response.data.hints?.length > 0) {
      calories = response.data.hints[0].food.nutrients.ENERC_KCAL || 0;
      imageUrl = response.data.hints[0].food.image || "";
      category = response.data.hints[0].food.category || "";
    }

    // Save calorie details to database after fetching from Edamam API
    calorieDoc = await Calorie.findOneAndUpdate(
      { name: item },
      { calories, imageUrl, category },
      { upsert: true, new: true }
    );

    return res.json({ status: "success", calories });
  } catch (err) {
    console.error("Edamam API or DB error:", err.message);
    return res.status(500).json({ status: "error", message: "Failed to fetch calorie data" });
  }
});

// POST /api/calorie - save or update calorie info in DB manually if needed
calorieRouter.post("/", async (req, res) => {
  try {
    const { name, calories, category, imageUrl } = req.body;
    if (!name || calories === undefined) {
      return res.status(400).json({ status: "error", message: "Name and calories are required" });
    }

    const updated = await Calorie.findOneAndUpdate(
      { name },
      { calories, category, imageUrl },
      { new: true, upsert: true }
    );

    res.json({ status: "success", data: updated });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

export default calorieRouter;
