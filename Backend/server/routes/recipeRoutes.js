// AI_Kitchen/Backend/server/routes/recipeRoutes.js

import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Correct path to the data files in the Backend/data directory
const recipesPath = path.join(__dirname, '..', '..', 'data', 'recipes.json');
const ingredientsPath = path.join(__dirname, '..', '..', 'data', 'ingredients.json');

// Helper function to read a JSON file
const readJsonFile = async (filePath) => {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.error(`File not found: ${filePath}`);
            return [];
        }
        throw new Error(`Failed to read file ${filePath}: ${err.message}`);
    }
};

// Route to get recipes based on user's pantry
router.get('/pantrychef/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const [allRecipes, allIngredients] = await Promise.all([
            readJsonFile(recipesPath),
            readJsonFile(ingredientsPath)
        ]);

        const userPantry = allIngredients.find(p => p.id === userId);
        if (!userPantry || !userPantry.items) {
            return res.json({ success: true, message: 'No pantry found for this user.', data: [] });
        }

        const pantryItems = userPantry.items.map(item => item.toLowerCase());

        const matchingRecipes = allRecipes.filter(recipe => {
            const recipeIngredients = (recipe.ingredients || []).map(ing => {
                if (typeof ing === 'string') {
                    return ing.toLowerCase();
                }
                return ing.name.toLowerCase();
            });

            const matchCount = recipeIngredients.filter(ing => pantryItems.includes(ing)).length;

            return matchCount >= 3;
        });

        res.json({ success: true, data: matchingRecipes });
    } catch (err) {
        console.error('Error fetching pantry chef recipes:', err);
        res.status(500).json({ success: false, message: 'Failed to load recipes.' });
    }
});

export default router;