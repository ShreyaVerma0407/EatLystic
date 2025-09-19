import express from 'express';
import CustomRecipe from '../models/CustomRecipe.js';

const router = express.Router();

// GET all recipes for a specific user
router.get('/:userId', async (req, res) => {
  try {
    const recipes = await CustomRecipe.find({ userId: req.params.userId });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new recipe
router.post('/', async (req, res) => {
  const recipe = new CustomRecipe({
    userId: req.body.userId,
    name: req.body.name,
    ingredients: req.body.ingredients,
    approxTime: req.body.approxTime,
    instructions: req.body.instructions,
  });

  try {
    const newRecipe = await recipe.save();
    res.status(201).json(newRecipe);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT (update) an existing recipe
router.put('/:recipeId', async (req, res) => {
  try {
    const updatedRecipe = await CustomRecipe.findByIdAndUpdate(
      req.params.recipeId,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedRecipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json(updatedRecipe);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a recipe
router.delete('/:recipeId', async (req, res) => {
  try {
    const deletedRecipe = await CustomRecipe.findByIdAndDelete(req.params.recipeId);
    if (!deletedRecipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
