import express from "express";
import mongoose from "mongoose";
import ConsumptionLog from "../models/ConsumptionLog.js";

const router = express.Router();

// POST /api/consumption/log with upsert to avoid duplicates
router.post("/log", async (req, res) => {
  try {
    const { userId, pantryItemId, quantityConsumed, caloriesConsumed } = req.body;

    if (
      !userId ||
      !pantryItemId ||
      quantityConsumed === undefined ||
      caloriesConsumed === undefined
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Use upsert to update existing record or insert new one
    const log = await ConsumptionLog.findOneAndUpdate(
      { userId, pantryItemId },
      { quantityConsumed, caloriesConsumed, timestamp: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ status: "success", data: log });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Duplicate consumption log" });
    }
    console.error("Error saving consumption log:", err);
    res.status(500).json({ error: "Failed to log consumption" });
  }
});

// Aggregate calories consumed (no changes needed)
router.get("/aggregate", async (req, res) => {
  try {
    const { userId, interval } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }
    const groupFormat = interval === "min" ? "%Y-%m-%dT%H:%M" : "%Y-%m-%dT%H";

    const agg = await ConsumptionLog.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: {
            $dateToString: { format: groupFormat + ":00Z", date: "$timestamp" },
          },
          totalCalories: { $sum: "$caloriesConsumed" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      status: "success",
      data: agg.map((entry) => ({
        time: entry._id,
        calories: entry.totalCalories,
      })),
    });
  } catch (err) {
    console.error("Error aggregating consumption logs:", err);
    res.status(500).json({ error: "Failed to aggregate consumption" });
  }
});

export default router;
