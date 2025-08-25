import express from "express";
import DishRating from "../models/DishRating.js";

const router = express.Router();

router.post("/rate", async (req, res) => {
  const { dishId, rating } = req.body;

  if (!dishId || typeof rating !== "number" || rating < 1 || rating > 5) {
    return res.status(400).json({ status: "error", message: "Invalid input" });
  }

  try {
    // Upsert dish rating: increment count and sum
    const updated = await DishRating.findOneAndUpdate(
      { dishId },
      { $inc: { ratingsCount: 1, ratingsSum: rating } },
      { new: true, upsert: true }
    );
    res.json({
      status: "success",
      message: "Rating submitted",
      averageRating: updated.ratingsSum / updated.ratingsCount,
      ratingsCount: updated.ratingsCount,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

export default router;
