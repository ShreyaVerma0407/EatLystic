import mongoose from "mongoose";

const likedRecipeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  recipeId: { type: String, required: true },

  // store recipe details
  name: String,
  ingredients: [String],
  prep_time: String,
  type: String,
  image: String,
});

likedRecipeSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

export default mongoose.model("LikedRecipe", likedRecipeSchema);
