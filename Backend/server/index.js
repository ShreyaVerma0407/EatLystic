// index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import EmployeeModel from "./models/Employee.js";

const app = express();
app.use(express.json());
app.use(cors());

// Correct MongoDB Atlas connection string with database
mongoose.connect("mongodb+srv://shera1:pass1234@testd.uaa1xum.mongodb.net/employee?retryWrites=true&w=majority&appName=testd")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Register route
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ status: "error", message: "All fields are required" });
  }

  // Check if the email already exists in the 'register' collection
  EmployeeModel.findOne({ email })
    .then(existingUser => {
      if (existingUser) {
        return res.json({ status: "error", message: "Email already registered" });
      }

      // Create a new user in the 'register' collection
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

  // Check if the email exists in the 'register' collection
  EmployeeModel.findOne({ email })
    .then(user => {
      if (!user) {
        return res.json({ status: "error", message: "No record exists" });
      }

      // Check if the password matches
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
