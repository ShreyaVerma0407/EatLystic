<<<<<<< HEAD
import mongoose from "mongoose";

const fitnessSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  age: Number,
  gender: String,
  height: Number,
  weight: Number,
  activity: String,
  disease: String,
  sleep: Number,
  water: Number,
  energy: String,
  bmi: Number,
  idealIntake: Object,
  consumedCalories: Number,
  heartRate: Number,
  recommendations: [String],
}, { timestamps: true });

// ✅ Prevent exact duplicate per user
fitnessSchema.index(
  { userId: 1, age: 1, gender: 1, height: 1, weight: 1, activity: 1, disease: 1, sleep: 1, water: 1, energy: 1, bmi: 1, consumedCalories: 1, heartRate: 1 },
  { unique: true }
);

export default mongoose.model("FitnessData", fitnessSchema);
=======
import mongoose from "mongoose";

const fitnessSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  age: Number,
  gender: String,
  height: Number,
  weight: Number,
  activity: String,
  disease: String,
  sleep: Number,
  water: Number,
  energy: String,
  bmi: Number,
  idealIntake: Object,
  consumedCalories: Number,
  heartRate: Number,
  recommendations: [String],
}, { timestamps: true });

// ✅ Prevent exact duplicate per user
fitnessSchema.index(
  { userId: 1, age: 1, gender: 1, height: 1, weight: 1, activity: 1, disease: 1, sleep: 1, water: 1, energy: 1, bmi: 1, consumedCalories: 1, heartRate: 1 },
  { unique: true }
);

export default mongoose.model("FitnessData", fitnessSchema);
>>>>>>> 8f11c4efa5d86bd8ebbe6a7bd4da4d0332e7a6df
