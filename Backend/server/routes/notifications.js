import express from "express";
import Employee from "../models/Employee.js";
import Pantry from "../models/PantryItem.js"; // pantry items
import NotificationLog from "../models/NotificationLog.js";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/send-expiry-notification/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. Fetch employee email
    const employee = await Employee.findById(userId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    const userEmail = employee.email;

    // 2. Fetch pantry items
    const pantryItems = await Pantry.find({ userId });
    const expiringItems = pantryItems.filter(item => {
      const days = Math.ceil((new Date(item.expiry) - new Date()) / (1000*60*60*24));
      return days <= 3 && days >= 0;
    });

    if (expiringItems.length === 0) {
      return res.json({ message: "No expiring items" });
    }

    // 3. Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    const itemList = expiringItems.map(item => `- ${item.name}, expires on ${item.expiry}`).join("\n");

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "Pantry Expiry Notification",
      text: `Hello ${employee.name},\n\nThe following items in your pantry are expiring soon:\n\n${itemList}\n\nPlease use them in time.\n\nThanks!`
    };

    await transporter.sendMail(mailOptions);

    // 4. Mark items as emailed & save notification log
    for (const item of expiringItems) {
      item.emailSent = true;
      await item.save();
    }

    const log = new NotificationLog({
      userId,
      itemIds: expiringItems.map(i => i._id),
      status: "sent",
    });
    await log.save();

    res.json({ message: "Expiry email sent successfully" });

  } catch (error) {
    console.error(error);

    // Optional: log failed attempt
    if (req.params.userId) {
      const log = new NotificationLog({
        userId: req.params.userId,
        itemIds: [],
        status: "failed",
      });
      await log.save();
    }

    res.status(500).json({ message: "Server error" });
  }
});

export default router;
