import express from "express";
import nodemailer from "nodemailer";
import Employee from "../models/Employee.js";
import Email from "../models/Email.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { userId, pdfBase64 } = req.body;

  try {
    const employee = await Employee.findById(userId).select("email name");
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    if (!pdfBase64)
      return res.status(400).json({ error: "No PDF provided" });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS,  },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: employee.email,
      subject: "Pantry Report PDF",
      text: "Hello! Here is your pantry report PDF.",
      attachments: [
        {
          filename: "PantryReport.pdf",
          content: pdfBase64,
          encoding: "base64",
        },
      ],
    });

    const emailRecord = new Email({
      userId,
      to: employee.email,
      subject: "Pantry Report PDF",
      body: "Sent PDF report",
      type: "report",
      status: "sent",
    });

    await emailRecord.save();

    res.status(200).json({ success: true, message: "PDF sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "PDF email failed" });
  }
});

export default router;
