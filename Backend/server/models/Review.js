import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  stars: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  text: {
    type: String,
    required: true
  }
});

const ReviewModel = mongoose.model('Review', ReviewSchema);
export default ReviewModel;