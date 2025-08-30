import mongoose from "mongoose";

const emailSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  pantryItemId: { type: mongoose.Schema.Types.ObjectId, ref: "Pantry", required: true },
  to: { type: String, required: true },
  subject: String,
  body: String,
  type: { type: String, enum: ["expired", "expiringSoon"], required: true },
  status: { type: String, enum: ["sent", "failed"], default: "sent" },
  createdAt: { type: Date, default: Date.now },
});

// ✅ Prevent duplicates of same type for same pantry item and user
emailSchema.index({ userId: 1, pantryItemId: 1, type: 1 }, { unique: true });

export default mongoose.model("Email", emailSchema);
