import express from "express";
import CookedRecipe from "../models/CookedRecipe.js";

const router = express.Router();

// POST /api/recipes/cooked
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

export default router;
