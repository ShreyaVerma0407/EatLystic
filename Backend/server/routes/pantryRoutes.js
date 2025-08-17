// routes/pantryRoutes.js
import express from "express";
import PantryItem from "../models/PantryItem.js";

const router = express.Router();

// Get all pantry items for a user
router.get("/:userId", async (req, res) => {
  try {
    const items = await PantryItem.find({ userId: req.params.userId });
    res.json({ status: "success", data: items });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Add new pantry item
router.post("/", async (req, res) => {
  try {
    const { userId, name, quantity, consumed, category, expiry, imageUrl } = req.body;

    // Validate required fields except quantity separately to allow 0
    if (!userId || !name || !category || !expiry) {
      return res.status(400).json({ status: "error", message: "Missing required fields" });
    }

    // Validate quantity separately: allow 0, must be number and not negative
    if (
      quantity === undefined ||
      quantity === null ||
      typeof quantity !== "number" ||
      quantity < 0
    ) {
      return res.status(400).json({ status: "error", message: "Invalid quantity" });
    }

    // Ensure consumed is a number and defaults to 0 if invalid
    const consumedValue = typeof consumed === "number" && consumed >= 0 ? consumed : 0;

    if (consumedValue > quantity) {
      return res.status(400).json({ status: "error", message: "Consumed cannot exceed quantity" });
    }

    const newItem = new PantryItem({
      userId,
      name,
      quantity,
      consumed: consumedValue,
      category,
      expiry,
      imageUrl,
    });

    const savedItem = await newItem.save();

    res.json({ status: "success", data: savedItem });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Update pantry item by ID
router.put("/:id", async (req, res) => {
  try {
    const { consumed, quantity } = req.body;

    // Optional validation: consumed cannot exceed quantity if both provided
    if (
      typeof consumed === "number" &&
      typeof quantity === "number" &&
      consumed > quantity
    ) {
      return res.status(400).json({
        status: "error",
        message: "Consumed cannot exceed quantity",
      });
    }

    const updatedItem = await PantryItem.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedItem)
      return res.status(404).json({ status: "error", message: "Item not found" });

    res.json({ status: "success", data: updatedItem });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Delete pantry item by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedItem = await PantryItem.findByIdAndDelete(req.params.id);
    if (!deletedItem)
      return res.status(404).json({ status: "error", message: "Item not found" });
    res.json({ status: "success", message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

export default router;
