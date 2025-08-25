<<<<<<< HEAD
import express from "express";
import TotalNutrient from "../models/TotalNutrient.js";

const router = express.Router();

// Batch save total nutrients safely with upsert
router.post("/", async (req, res) => {
  try {
    const items = req.body; // expecting an array of { userId, itemName, nutrients }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ status: "error", message: "No data provided" });
    }

    const validItems = items.filter(item => item.userId && item.itemName && item.nutrients);

    if (validItems.length === 0) {
      return res.status(400).json({ status: "error", message: "No valid items to save" });
    }

    const results = [];
    for (const item of validItems) {
      const result = await TotalNutrient.updateOne(
        { userId: item.userId, itemName: item.itemName }, // filter
        { $set: { nutrients: item.nutrients } },          // update
        { upsert: true }                                 // insert if not exists
      );
      results.push(result);
    }

    res.json({ status: "success", message: "Total nutrients saved/updated", data: results });
  } catch (err) {
    console.error("Error saving total nutrients:", err);
    res.status(500).json({ status: "error", message: "Failed to save total nutrients" });
  }
});

export default router;
=======
import express from "express";
import TotalNutrient from "../models/TotalNutrient.js";

const router = express.Router();

// Batch save total nutrients safely with upsert
router.post("/", async (req, res) => {
  try {
    const items = req.body; // expecting an array of { userId, itemName, nutrients }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ status: "error", message: "No data provided" });
    }

    const validItems = items.filter(item => item.userId && item.itemName && item.nutrients);

    if (validItems.length === 0) {
      return res.status(400).json({ status: "error", message: "No valid items to save" });
    }

    const results = [];
    for (const item of validItems) {
      const result = await TotalNutrient.updateOne(
        { userId: item.userId, itemName: item.itemName }, // filter
        { $set: { nutrients: item.nutrients } },          // update
        { upsert: true }                                 // insert if not exists
      );
      results.push(result);
    }

    res.json({ status: "success", message: "Total nutrients saved/updated", data: results });
  } catch (err) {
    console.error("Error saving total nutrients:", err);
    res.status(500).json({ status: "error", message: "Failed to save total nutrients" });
  }
});

export default router;
>>>>>>> 8f11c4efa5d86bd8ebbe6a7bd4da4d0332e7a6df
