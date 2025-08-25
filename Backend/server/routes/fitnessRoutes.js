<<<<<<< HEAD
import express from "express";
import FitnessData from "../models/FitnessData.js";

const router = express.Router();

// ✅ Save Fitness Data (prevent duplicate)
router.post("/save", async (req, res) => {
  try {
    const data = req.body;

    // Check for duplicate entry
    const exists = await FitnessData.findOne({
      userId: data.userId,
      age: data.age,
      gender: data.gender,
      height: data.height,
      weight: data.weight,
      activity: data.activity,
      disease: data.disease,
      sleep: data.sleep,
      water: data.water,
      energy: data.energy,
      bmi: data.bmi,
      consumedCalories: data.consumedCalories,
      heartRate: data.heartRate
    });

    if (exists) {
      return res.status(400).json({ message: "Duplicate entry! Not stored." });
    }

    const newData = new FitnessData(data);
    await newData.save();

    res.status(201).json({ message: "Data stored successfully ✅", data: newData });
  } catch (err) {
    res.status(500).json({ message: "Server error ❌", error: err.message });
  }
});

// ✅ Get all fitness history of a user
router.get("/:userId", async (req, res) => {
  try {
    const data = await FitnessData.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
=======
import express from "express";
import FitnessData from "../models/FitnessData.js";

const router = express.Router();

// ✅ Save Fitness Data (prevent duplicate)
router.post("/save", async (req, res) => {
  try {
    const data = req.body;

    // Check for duplicate entry
    const exists = await FitnessData.findOne({
      userId: data.userId,
      age: data.age,
      gender: data.gender,
      height: data.height,
      weight: data.weight,
      activity: data.activity,
      disease: data.disease,
      sleep: data.sleep,
      water: data.water,
      energy: data.energy,
      bmi: data.bmi,
      consumedCalories: data.consumedCalories,
      heartRate: data.heartRate
    });

    if (exists) {
      return res.status(400).json({ message: "Duplicate entry! Not stored." });
    }

    const newData = new FitnessData(data);
    await newData.save();

    res.status(201).json({ message: "Data stored successfully ✅", data: newData });
  } catch (err) {
    res.status(500).json({ message: "Server error ❌", error: err.message });
  }
});

// ✅ Get all fitness history of a user
router.get("/:userId", async (req, res) => {
  try {
    const data = await FitnessData.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
>>>>>>> 8f11c4efa5d86bd8ebbe6a7bd4da4d0332e7a6df
