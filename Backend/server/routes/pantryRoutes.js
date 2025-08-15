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
    console.log("Add pantry item request body:", req.body);

    const { userId, name, quantity, consumed, category, expiry, imageUrl } = req.body;

    // Validate required fields except quantity separately to allow 0
    if (!userId || !name || !category || !expiry) {
      console.log("Missing required fields");
      return res.status(400).json({ status: "error", message: "Missing required fields" });
    }

    // Validate quantity separately: allow 0, but quantity must be number and not negative
    if (quantity == null || isNaN(quantity) || quantity < 0) {
      console.log("Invalid quantity value");
      return res.status(400).json({ status: "error", message: "Invalid quantity" });
    }

    // Ensure consumed is a number and default to 0
    const consumedValue = typeof consumed === "number" ? consumed : 0;

    const newItem = new PantryItem({
      userId,
      name,
      quantity,
      consumed: consumedValue,
      category,
      expiry,
      imageUrl,
    });

    await newItem.save();

    console.log("New pantry item saved:", newItem);
    res.json({ status: "success", data: newItem });
  } catch (err) {
    console.error("Error saving pantry item:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Update pantry item
router.put("/:id", async (req, res) => {
  try {
    const { consumed, quantity } = req.body;

    // You may add validation for consumed <= quantity here if needed

    const updatedItem = await PantryItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedItem) return res.status(404).json({ status: "error", message: "Item not found" });
    res.json({ status: "success", data: updatedItem });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Delete pantry item
router.delete("/:id", async (req, res) => {
  try {
    const deletedItem = await PantryItem.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ status: "error", message: "Item not found" });
    res.json({ status: "success", message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

export default router;
