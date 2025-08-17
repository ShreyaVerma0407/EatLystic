import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import EmployeeModel from "./server/models/Employee.js";
import pantryRoutes from "./server/routes/pantryRoutes.js";
import calorieRouter from "./server/routes/calorieRoutes.js";
import consumptionRoutes from "./server/routes/consumptionRoutes.js";

const app = express();

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://shera1:pass1234@testd.uaa1xum.mongodb.net/employee?retryWrites=true&w=majority&appName=testd"
  )
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Register user route
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ status: "error", message: "All fields are required" });
  }

  EmployeeModel.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        return res.json({ status: "error", message: "Email already registered" });
      }

      EmployeeModel.create(req.body)
        .then((employee) =>
          res.json({ status: "success", message: "User registered successfully", data: employee })
        )
        .catch((err) => res.json({ status: "error", message: err.message }));
    })
    .catch((err) => res.json({ status: "error", message: err.message }));
});

// Login route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ status: "error", message: "Email and password are required" });
  }

  EmployeeModel.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.json({ status: "error", message: "No record exists" });
      }

      if (user.password === password) {
        res.json({ status: "success", message: "Login successful", user });
      } else {
        res.json({ status: "error", message: "The password is incorrect" });
      }
    })
    .catch((err) => res.json({ status: "error", message: err.message }));
});

// Use pantry routes for /api/pantry
app.use("/api/pantry", pantryRoutes);

// Use calorie routes for /api/calorie
app.use("/api/calorie", calorieRouter);

// Use consumption routes for /api/consumption
app.use("/api/consumption", consumptionRoutes);

// Start server
app.listen(3001, () => {
  console.log("🚀 Server is running on port 3001");
});
