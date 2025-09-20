import express from 'express';
import ReviewModel from '../models/Review.js';

const router = express.Router();

// Route to get all reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await ReviewModel.find();
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error });
  }
});

// Route to add a new review
router.post('/', async (req, res) => {
  // ✅ UPDATED: Use 'stars' and 'text' from the request body
  const { name, stars, text } = req.body;
  
  if (!name || !stars || !text) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newReview = new ReviewModel({
      name,
      stars,
      text
    });
    
    await newReview.save();
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: 'Error saving review', error });
  }
});

// Route to update a review
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  // ✅ UPDATED: Use 'stars' and 'text' from the request body
  const { stars, text } = req.body;

  try {
    const updatedReview = await ReviewModel.findByIdAndUpdate(
      id,
      // ✅ UPDATED: Update 'stars' and 'text' fields
      { stars, text },
      { new: true, runValidators: true }
    );
    if (!updatedReview) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(200).json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Error updating review', error });
  }
});

// Route to delete a review
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedReview = await ReviewModel.findByIdAndDelete(id);
    if (!deletedReview) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error });
  }
});

export default router;