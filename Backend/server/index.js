// index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import EmployeeModel from "./models/Employee.js";
import pantryRoutes from "./routes/pantryRoutes.js";
import nutritionApp from "./server.js"; // Import nutrition server

const app = express();
app.use(express.json());
app.use(cors());

// --------------------
// MongoDB Connection
// --------------------
mongoose.connect(
  "mongodb+srv://shera1:pass1234@testd.uaa1xum.mongodb.net/employee?retryWrites=true&w=majority&appName=testd"
)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

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
    if (existingUser) {
      return res.json({ status: "error", message: "Email already registered" });
    }

    const employee = await EmployeeModel.create(req.body);
    res.json({ status: "success", message: "User registered successfully", data: employee });
  } catch (err) {
    res.json({ status: "error", message: err.message });
  }
});

// --------------------
// User Login
// --------------------
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ status: "error", message: "Email and password are required" });
  }

  try {
    const user = await EmployeeModel.findOne({ email });
    if (!user) {
      return res.json({ status: "error", message: "No record exists" });
    }

    if (user.password === password) {
      res.json({ status: "success", message: "Login successful", user });
    } else {
      res.json({ status: "error", message: "The password is incorrect" });
    }
  } catch (err) {
    res.json({ status: "error", message: err.message });
  }
});

// --------------------
// Pantry Routes
// --------------------
app.use("/api/pantry", pantryRoutes);

// --------------------
// Start Main Server
// --------------------
const MAIN_PORT = 3001;
const NUTRITION_PORT = 5000;

app.listen(MAIN_PORT, () => {
  console.log(`🚀 Main server running on port ${MAIN_PORT}`);

  // Start Nutrition Server
  nutritionApp.listen(NUTRITION_PORT, () => {
    console.log(`✅ Nutrition server running on port ${NUTRITION_PORT}`);
  });
});
