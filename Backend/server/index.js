// index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import EmployeeModel from "./models/Employee.js";

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/employee")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Register route
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ status: "error", message: "All fields are required" });
  }

  EmployeeModel.findOne({ email })
    .then(existingUser => {
      if (existingUser) {
        return res.json({ status: "error", message: "Email already registered" });
      }

      EmployeeModel.create(req.body)
        .then(employee => res.json({ status: "success", message: "User registered successfully", data: employee }))
        .catch(err => res.json({ status: "error", message: err.message }));
    })
    .catch(err => res.json({ status: "error", message: err.message }));
});

// Login route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ status: "error", message: "Email and password are required" });
  }

  EmployeeModel.findOne({ email })
    .then(user => {
      if (!user) {
        return res.json({ status: "error", message: "No record exists" });
      }

      if (user.password === password) {
        res.json({ status: "success", message: "Login successful", user });
      } else {
        res.json({ status: "error", message: "The password is incorrect" });
      }
    })
    .catch(err => res.json({ status: "error", message: err.message }));
});

app.listen(3001, () => {
  console.log("🚀 Server is running on port 3001");
});
