import mongoose from "mongoose";

const CartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  items: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, default: 1 },
      expiryDate: { type: Date, default: null },
    },
  ],
});

export default mongoose.model("Cart", CartSchema);
