import express from "express";
import SessionModel from "../models/Session.js"; // new session model

const router = express.Router();

router.post("/", async (req, res) => {
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ message: "User ID required" });

  try {
    // Upsert: update if exists, insert if not
    await SessionModel.findOneAndUpdate(
      { userId }, // filter by userId
      {
        sessionToken: null,
        lastLogout: new Date()
      },
      { upsert: true, new: true } // upsert ensures only one entry per user
    );

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
