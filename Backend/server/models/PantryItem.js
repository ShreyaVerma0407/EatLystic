// models/PantryItem.js

import mongoose from "mongoose";

const PantryItemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    consumed: { type: Number, default: 0 },
    category: { type: String, required: true },
    expiry: { type: String, required: true },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

const PantryItem = mongoose.model("PantryItem", PantryItemSchema);
export default PantryItem;
