import express from 'express';
import ContactMessage from '../models/ContactMessage.js';

const router = express.Router();

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Simple validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ status: 'error', message: 'All fields are required.' });
    }

    const newContactMessage = new ContactMessage({
      name,
      email,
      subject,
      message,
    });

    await newContactMessage.save();

    res.status(201).json({ status: 'success', message: 'Message sent successfully!', data: newContactMessage });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

export default router;