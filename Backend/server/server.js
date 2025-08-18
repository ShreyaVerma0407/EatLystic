

import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

// Endpoint to fetch all nutrients
router.get("/", (req, res) => {
  const jsonPath = path.join(process.cwd(), "public", "nutrient.json"); // Adjust path if needed
  fs.readFile(jsonPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading nutrient.json:", err);
      return res.status(500).json({ status: "error", message: "Failed to load nutrients" });
    }
    try {
      const nutrients = JSON.parse(data);
      res.json({ status: "success", data: nutrients });
    } catch (parseErr) {
      console.error("Error parsing nutrient.json:", parseErr);
      res.status(500).json({ status: "error", message: "Failed to parse nutrients" });
    }
  });
});

export default router;
