import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ReviewModel from './models/Review.js';

// Get the current directory of the file using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hardcoded Mongo URI
const MONGO_URI = 'mongodb+srv://shera1:pass1234@testd.uaa1xum.mongodb.net/employee?retryWrites=true&w=majority&appName=testd';

// Log Mongo URI to confirm it's being used
console.log('Using Mongo URI:', MONGO_URI);

// Connect to MongoDB using Mongoose
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit if connection fails
  });

// Fetch reviews from MongoDB and store them in a JSON file
const fetchAndStoreReviews = async () => {
  try {
    // Fetch all reviews from the database
    const reviews = await ReviewModel.find();

    // Specify the path for the JSON file in the Frontend folder (public/data)
    const reviewsFilePath = path.join(__dirname, '../../frontend/public/data/reviews.json'); // Correct path

    // Write the reviews to the reviews.json file
    fs.writeFileSync(reviewsFilePath, JSON.stringify(reviews, null, 2));

    console.log(`Reviews have been successfully written to ${reviewsFilePath}`);
  } catch (error) {
    console.error('Error fetching or saving reviews:', error);
  }
};

// Call the function to fetch and store reviews
fetchAndStoreReviews();
