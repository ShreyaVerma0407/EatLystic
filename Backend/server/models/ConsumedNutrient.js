import mongoose from "mongoose";
const consumedNutrientSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  itemName: { type: String, required: true },
  consumedQuantity: { type: Number, default: 1 },
  nutrients: {
    protein_g: Number,
    fat_total_g: Number,
    carbohydrates_total_g: Number,
    fiber_g: Number,
  },
  consumedAt: { type: Date, default: Date.now },
});

// Prevent duplicate consumed entries for same user + item
consumedNutrientSchema.index({ userId: 1, itemName: 1 }, { unique: true });

export default mongoose.model("ConsumedNutrient", consumedNutrientSchema);
