import express from "express";
import CookedRecipe from "../models/CookedRecipe.js";

const router = express.Router();

// POST /api/recipes/cooked (Existing code)
router.post("/", async (req, res) => {
  try {
    const { name, ingredients, nutritionalContent } = req.body;

    if (!name || !ingredients) {
      return res.status(400).json({ status: "error", message: "Missing fields" });
    }

    const saved = await CookedRecipe.create({
      name,
      ingredients,
      nutritionalContent,
    });

    res.json({ status: "success", message: "Cooked recipe saved", data: saved });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// -------------------------------------------------------------------
// NEW CODE: GET /api/recipes/cooked - FETCH ALL RECIPES
// -------------------------------------------------------------------

/**
 * @route GET /api/recipes/cooked
 * @description Fetches all cooked recipes from the database, sorted by the most recent first.
 * @access Public
 */
router.get("/", async (req, res) => {
  try {
    // Retrieve all documents and sort by 'cookedAt' descending (-1)
    const recipes = await CookedRecipe.find({}).sort({ cookedAt: -1 });

    if (recipes.length === 0) {
      // Respond with 404 if the collection is empty, but include a success status for a valid fetch operation
      return res.status(200).json({ status: "success", message: "No cooked recipes found.", data: [] });
    }

    // Respond with the array of recipes
    res.json({ status: "success", message: "Cooked recipes fetched successfully", data: recipes });
  } catch (err) {
    // Handle database or server errors
    res.status(500).json({ status: "error", message: "Failed to fetch recipes: " + err.message });
  }
});

export default router;