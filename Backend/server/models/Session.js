import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "employees", required: true },
  sessionToken: { type: String, default: null },
  lastLogout: { type: Date, default: Date.now }
});
SessionSchema.index({ userId: 1 }, { unique: true });


const SessionModel = mongoose.model("sessions", SessionSchema);

export default SessionModel;
