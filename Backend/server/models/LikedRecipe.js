import mongoose from "mongoose";

const likedRecipeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  recipeId: { type: String, required: true },
});

likedRecipeSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

export default mongoose.model("LikedRecipe", likedRecipeSchema);
