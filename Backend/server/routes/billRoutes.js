import express from "express";
import multer from "multer";
import { spawn } from "child_process";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/scan-bill", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: "No file uploaded",
      items: []
    });
  }

  const python = spawn("python", [
    "python/eatlystic_bill_parser.py",
    req.file.path
  ]);

  let output = "";

  python.stdout.on("data", (data) => {
    output += data.toString();
  });

  python.stderr.on("data", (data) => {
    console.error("PY ERROR:", data.toString());
  });

  python.on("close", () => {
    try {
      const cleaned = output.trim() || "[]";
      const parsed = JSON.parse(cleaned);

      return res.status(200).json({
        items: parsed
      });

    } catch (err) {
      console.error("Python output not JSON:", output);

      return res.status(500).json({
        error: "Invalid Python output",
        raw: output,
        items: []
      });
    }
  });
});

export default router;