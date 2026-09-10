const mongoose = require("mongoose");

const policySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["shipping", "return", "privacy", "terms", "about"],
      required: true,
      unique: true,
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Policy", policySchema);
