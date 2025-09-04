import express from "express";
import LikedRecipe from "../models/LikedRecipe.js";

const router = express.Router();

// ✅ Like a recipe (save to DB)
router.post("/", async (req, res) => {
  const { userId, recipeId, name, ingredients, prep_time, type, image } = req.body;
  if (!userId || !recipeId) {
    return res.status(400).json({ status: "error", message: "Missing fields" });
  }
  try {
    await LikedRecipe.updateOne(
      { userId, recipeId },
      { $set: { userId, recipeId, name, ingredients, prep_time, type, image } },
      { upsert: true }
    );
    res.json({ status: "success", message: "Recipe liked" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ✅ Unlike (remove from DB)
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

// ✅ Fetch all liked recipes for a user
router.get("/:userId", async (req, res) => {
  try {
    const liked = await LikedRecipe.find({ userId: req.params.userId });
    res.json({ status: "success", data: liked });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

export default router;
