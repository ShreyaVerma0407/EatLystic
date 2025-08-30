import mongoose from "mongoose";

const notificationLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  itemIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pantry" }],
  sentAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["sent", "failed"], default: "sent" },
});

export default mongoose.model("NotificationLog", notificationLogSchema);
