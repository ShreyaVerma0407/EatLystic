import mongoose from "mongoose";

const CustomRecipeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  ingredients: {
    type: String,
    required: true,
  },
  approxTime: {
    type: Number,
  },
  instructions: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CustomRecipe = mongoose.model("CustomRecipe", CustomRecipeSchema);
export default CustomRecipe;