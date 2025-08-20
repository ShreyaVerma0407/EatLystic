// routes/consumed.js
import express from "express";
import ConsumedNutrient from "../models/ConsumedNutrient.js";

const router = express.Router();

// Save consumed nutrient
router.post("/", async (req, res) => {
  try {
    const { userId, itemName, consumedQuantity, nutrients } = req.body;
    const record = new ConsumedNutrient({ userId, itemName, consumedQuantity, nutrients });
    await record.save();
    res.json({ status: "success", data: record });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: "error", message: e.message });
  }
});

export default router;
