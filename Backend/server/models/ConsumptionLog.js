import mongoose from "mongoose";

const consumptionLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  pantryItemId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "PantryItem" },
  quantityConsumed: { type: Number, required: true },
  caloriesConsumed: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Add compound unique index on userId + pantryItemId to prevent duplicates
consumptionLogSchema.index({ userId: 1, pantryItemId: 1 }, { unique: true });

const ConsumptionLog = mongoose.model("ConsumptionLog", consumptionLogSchema);
export default ConsumptionLog;
