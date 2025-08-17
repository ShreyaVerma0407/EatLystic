import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import EmployeeModel from "./server/models/Employee.js"; // Use correct path as per your project structure
import pantryRoutes from "./server/routes/pantryRoutes.js";
import calorieRouter from "./server/routes/calorieRoutes.js";
import consumptionRoutes from "./server/routes/consumptionRoutes.js";

const app = express();
app.use(express.json());
app.use(cors());

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

// --------------------
// Start Server
// --------------------
const MAIN_PORT = 3001;

app.listen(MAIN_PORT, () => {
  console.log(`🚀 Server is running on port ${MAIN_PORT}`);
});
