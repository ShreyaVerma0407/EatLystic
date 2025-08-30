// server/models/Calorie.js
import mongoose from "mongoose";

const CalorieSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    calories: { type: Number, required: true }, // calories per item
    category: { type: String },                  // optional, for grouping
    imageUrl: { type: String },                  // optional
  },
  { timestamps: true }
);

const Calorie = mongoose.model("Calorie", CalorieSchema);
export default Calorie;
