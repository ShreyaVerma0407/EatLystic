// models/ConsumedNutrient.js
import mongoose from "mongoose";

const consumedNutrientSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  itemName: { type: String, required: true },
  consumedQuantity: { type: Number, default: 1 },
  nutrients: {
    calories: Number,
    protein_g: Number,
    fat_total_g: Number,
    carbohydrates_total_g: Number,
    fiber_g: Number,
    sugar_g: Number,
  },
  consumedAt: { type: Date, default: Date.now },
});

export default mongoose.model("ConsumedNutrient", consumedNutrientSchema);
