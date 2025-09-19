import mongoose from 'mongoose';

const customRecipeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  ingredients: {
    type: String,
    required: true
  },
  approxTime: {
    type: Number,
    required: false
  },
  instructions: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('CustomRecipe', customRecipeSchema);
