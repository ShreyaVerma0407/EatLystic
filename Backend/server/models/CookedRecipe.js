import mongoose from "mongoose";

const CookedRecipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ingredients: { type: Array, required: true },
  nutritionalContent: { type: Object }, // nutrition is optional
  cookedAt: { type: Date, default: Date.now },
});

const CookedRecipe = mongoose.model("CookedRecipe", CookedRecipeSchema);

export default CookedRecipe;
