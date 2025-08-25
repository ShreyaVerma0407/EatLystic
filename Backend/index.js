import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";

// --- Model Imports ---
import EmployeeModel from "./server/models/Employee.js";
import DishRating from "./server/models/DishRating.js";
import LikedRecipe from "./server/models/LikedRecipe.js";
import CustomRecipe from "./server/models/CustomRecipe.js";

// --- Route Imports ---
import pantryRoutes from "./server/routes/pantryRoutes.js";
import calorieRouter from "./server/routes/calorieRoutes.js";
import consumptionRoutes from "./server/routes/consumptionRoutes.js";
import consumedRoutes from "./server/routes/consumed.js";
import totalNutrientRoutes from "./server/routes/nutrientsTotal.js";
import fitnessRoutes from "./server/routes/fitnessRoutes.js";
import likedRoutes from "./server/routes/likedRoutes.js";
import cookedRoutes from "./server/routes/cookedRoutes.js";
import recipeRoutes from "./server/routes/recipeRoutes.js"; // This route is not in your original but is likely needed

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// --------------------
// MongoDB Connection
// --------------------
mongoose
  .connect(
    "mongodb+srv://shera1:pass1234@testd.uaa1xum.mongodb.net/employee?retryWrites=true&w=majority&appName=testd"
  )
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --------------------
// User Authentication Routes
// --------------------
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.json({ status: "error", message: "All fields are required" });
  }

  try {
    const existingUser = await EmployeeModel.findOne({ email });
    if (existingUser)
      return res.json({ status: "error", message: "Email already registered" });

    const employee = await EmployeeModel.create(req.body);
    res.json({
      status: "success",
      message: "User registered successfully",
      data: employee,
    });
  } catch (err) {
    res.json({ status: "error", message: err.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.json({ status: "error", message: "Email and password required" });

  try {
    const user = await EmployeeModel.findOne({ email });
    if (!user) return res.json({ status: "error", message: "No record exists" });

    if (user.password === password)
      res.json({ status: "success", message: "Login successful", user });
    else res.json({ status: "error", message: "The password is incorrect" });
  } catch (err) {
    res.json({ status: "error", message: err.message });
  }
});

// --------------------
// API Routes
// --------------------
// Dish Rating API POST /api/ratings/rate
app.post("/api/ratings/rate", async (req, res) => {
  const { dishId, rating } = req.body;
  if (!dishId || typeof rating !== "number" || rating < 1 || rating > 5) {
    return res.status(400).json({ status: "error", message: "Invalid input" });
  }
  try {
    const updated = await DishRating.findOneAndUpdate(
      { dishId },
      { $inc: { ratingsCount: 1, ratingsSum: rating } },
      { new: true, upsert: true }
    );
    res.json({
      status: "success",
      message: "Rating submitted",
      averageRating: updated.ratingsSum / updated.ratingsCount,
      ratingsCount: updated.ratingsCount,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Custom Recipe API Routes
app.get("/api/custom-recipes/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const recipes = await CustomRecipe.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(recipes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching recipes", error: err.message });
  }
});

app.post("/api/custom-recipes", async (req, res) => {
  try {
    const newRecipe = new CustomRecipe(req.body);
    await newRecipe.save();
    res.status(201).json({ message: "Recipe saved successfully", recipe: newRecipe });
  } catch (err) {
    res.status(500).json({ message: "Error saving recipe", error: err.message });
  }
});

app.put("/api/custom-recipes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedRecipe = await CustomRecipe.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.status(200).json({ message: "Recipe updated successfully", recipe: updatedRecipe });
  } catch (err) {
    res.status(500).json({ message: "Error updating recipe", error: err.message });
  }
});

app.delete("/api/custom-recipes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRecipe = await CustomRecipe.findByIdAndDelete(id);
    if (!deletedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting recipe", error: err.message });
  }
});

// Mount the route files
app.use("/api/pantry", pantryRoutes);
app.use("/api/calorie", calorieRouter);
app.use("/api/consumption", consumptionRoutes);
app.use("/api/consumed", consumedRoutes);
app.use("/api/nutrients-total", totalNutrientRoutes);
app.use("/api/fitness", fitnessRoutes);
app.use("/api/likes", likedRoutes);
app.use("/api/recipes/cooked", cookedRoutes);
app.use("/api/recipes", recipeRoutes); // Assuming you have this route file

// --------------------
// Start Server
// --------------------
const MAIN_PORT = 3001;

app.listen(MAIN_PORT, () => {
  console.log(`🚀 Server is running on port ${MAIN_PORT}`);
});