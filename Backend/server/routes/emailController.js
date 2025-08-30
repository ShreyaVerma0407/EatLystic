import express from "express";
import nodemailer from "nodemailer";
import Employee from "../models/Employee.js";
import Email from "../models/Email.js";

const router = express.Router();

router.post("/send", async (req, res) => {
  const { userId, pantryItemId, type, subject, text } = req.body;

  try {
    const employee = await Employee.findById(userId).select("email name");
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: "aikitchen811@gmail.com", pass: "nfzc rhfk sejo zybi" }, // add your password or app password
    });

    await transporter.sendMail({
      from: "aikitchen811@gmail.com",
      to: employee.email,
      subject,
      text,
    });

    // Save email entry in DB
    const emailRecord = new Email({
      userId,
      pantryItemId,
      to: employee.email,
      subject,
      body: text,
      type,
      status: "sent",
    });

    await emailRecord.save(); // duplicate will throw an error

    res.status(200).json({
      success: true,
      message: `Email sent to ${employee.email} and saved in DB`,
    });
  } catch (err) {
    console.error(err);

    // Handle duplicate key error
    if (err.code === 11000) {
      return res.status(200).json({
        success: false,
        message: "Duplicate email: Email of this type already sent",
      });
    }

    res.status(500).json({
      success: false,
      error: "Email could not be sent or saved in DB",
    });
  }
});
export default router;