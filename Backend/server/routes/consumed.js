import express from "express";
import ConsumedNutrient from "../models/ConsumedNutrient.js";

const router = express.Router();

// Save or update consumed nutrient
router.post("/", async (req, res) => {
  try {
    const { userId, itemName, consumedQuantity, nutrients } = req.body;

    // Update if exists, otherwise create
    const record = await ConsumedNutrient.findOneAndUpdate(
      { userId, itemName }, // match by user + item
      { consumedQuantity, nutrients, consumedAt: new Date() }, // new values
      { upsert: true, new: true, setDefaultsOnInsert: true } // create if not exist
    );

    res.json({ status: "success", data: record });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: "error", message: e.message });
  }
});
// -------------------- GET: Fetch all consumed nutrients for a user --------------------
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await ConsumedNutrient.find({ userId }).sort({ consumedAt: -1 });
    res.json({ status: "success", data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: "error", message: e.message });
  }
});
export default router;
