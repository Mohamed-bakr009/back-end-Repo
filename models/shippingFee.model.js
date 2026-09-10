const mongoose = require("mongoose");

const shippingFeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    fee: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ShippingFee", shippingFeeSchema);
