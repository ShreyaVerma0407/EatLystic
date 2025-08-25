<<<<<<< HEAD
import mongoose from "mongoose";

const nutrientSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  itemName: { type: String, required: true },
  nutrients: {
    protein_g: { type: Number, default: 0 },
    fat_total_g: { type: Number, default: 0 },
    carbohydrates_total_g: { type: Number, default: 0 },
    fiber_g: { type: Number, default: 0 },
  },
}, { timestamps: true });

// Add unique index before creating model
nutrientSchema.index({ userId: 1, itemName: 1 }, { unique: true });

const TotalNutrient = mongoose.model("TotalNutrient", nutrientSchema);

export default TotalNutrient;
=======
import mongoose from "mongoose";

const nutrientSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  itemName: { type: String, required: true },
  nutrients: {
    protein_g: { type: Number, default: 0 },
    fat_total_g: { type: Number, default: 0 },
    carbohydrates_total_g: { type: Number, default: 0 },
    fiber_g: { type: Number, default: 0 },
  },
}, { timestamps: true });

// Add unique index before creating model
nutrientSchema.index({ userId: 1, itemName: 1 }, { unique: true });

const TotalNutrient = mongoose.model("TotalNutrient", nutrientSchema);

export default TotalNutrient;
>>>>>>> 8f11c4efa5d86bd8ebbe6a7bd4da4d0332e7a6df
