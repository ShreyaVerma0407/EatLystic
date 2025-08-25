import express from "express";
import LikedRecipe from "../models/LikedRecipe.js";

const router = express.Router();

// Get all liked recipe IDs for a user
router.get("/:userId", async (req, res) => {
  try {
    const liked = await LikedRecipe.find({ userId: req.params.userId });
    res.json({ status: "success", liked: liked.map(l => l.recipeId) });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Like a recipe
router.post("/", async (req, res) => {
  const { userId, recipeId } = req.body;
  if (!userId || !recipeId) {
    return res.status(400).json({ status: "error", message: "Missing fields" });
  }
  try {
    await LikedRecipe.updateOne(
      { userId, recipeId },
      { $set: { userId, recipeId } },
      { upsert: true }
    );
    res.json({ status: "success", message: "Recipe liked" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Unlike a recipe
router.delete("/", async (req, res) => {
  const { userId, recipeId } = req.body;
  if (!userId || !recipeId) {
    return res.status(400).json({ status: "error", message: "Missing fields" });
  }
  try {
    await LikedRecipe.deleteOne({ userId, recipeId });
    res.json({ status: "success", message: "Recipe unliked" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

export default router;
