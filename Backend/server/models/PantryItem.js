// server/models/PantryItem.js

import mongoose from "mongoose";

const PantryItemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    consumed: { type: Number, default: 0, min: 0 },
    category: { type: String, required: true },
    expiry: { type: String, required: true },
    imageUrl: { type: String },
    unit: { type: String }, // optional unit for quantity (e.g., "grams", "pcs")
  },
  { timestamps: true }
);

const PantryItem = mongoose.model("PantryItem", PantryItemSchema);

export default PantryItem;
