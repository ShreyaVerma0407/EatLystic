import mongoose from "mongoose";

const DishRatingSchema = new mongoose.Schema({
  dishId: { type: String, required: true, unique: true }, 
  ratingsCount: { type: Number, default: 0 },
  ratingsSum: { type: Number, default: 0 },
});

DishRatingSchema.virtual("averageRating").get(function () {
  if (this.ratingsCount === 0) return 0;
  return this.ratingsSum / this.ratingsCount;
});

const DishRating = mongoose.model("DishRating", DishRatingSchema);

export default DishRating;
