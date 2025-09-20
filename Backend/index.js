import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();


// --------------------
// Import Models & Routes
// --------------------
import EmployeeModel from "./server/models/Employee.js";
import pantryRoutes from "./server/routes/pantryRoutes.js";
import calorieRouter from "./server/routes/calorieRoutes.js";
import consumptionRoutes from "./server/routes/consumptionRoutes.js";
import consumedRoutes from "./server/routes/consumed.js";
import totalNutrientRoutes from "./server/routes/nutrientsTotal.js";
import fitnessRoutes from "./server/routes/fitnessRoutes.js";
import notificationRoutes from "./server/routes/notifications.js";
import emailRoutes from "./server/routes/emailController.js";
import pdfEmailRoute from "./server/routes/pdfEmailRoute.js";
import cartRoutes from "./server/routes/cart.js";

// 🔹 NEW IMPORT for cooked recipes
import cookedRoutes from "./server/routes/cookedRoutes.js";

// 🔹 NEW IMPORT for liked recipes
import likedRoutes from "./server/routes/likedRoutes.js";

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// --------------------
// MongoDB Connection
// --------------------
mongoose
   .connect( process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --------------------
// User Registration
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

// --------------------
// User Login
// --------------------
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
app.use("/api/pantry", pantryRoutes);
app.use("/api/calorie", calorieRouter);
app.use("/api/consumption", consumptionRoutes);
app.use("/api/consumed", consumedRoutes);
app.use("/api/nutrients-total", totalNutrientRoutes);
app.use("/api/fitness", fitnessRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/email", emailRoutes);
app.use("/api/email", pdfEmailRoute);

// 🔹 NEW: Mount cooked recipes route
app.use("/api/recipes/cooked", cookedRoutes);

// 🔹 NEW: Mount liked recipes route
app.use("/api/liked", likedRoutes);
app.use("/cart", cartRoutes);

// --------------------
// Start Server
// --------------------
const MAIN_PORT = process.env.PORT || 3001;

app.listen(MAIN_PORT, () => {
  console.log(`🚀 Server is running on port ${MAIN_PORT}`);
});