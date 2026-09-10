const mongoose =require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    user: {
       type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
       type: String, 
       required: true, 
       trim: true
       },
    country: {
       type: String,
        required: true, 
        trim: true
       },
    city: {
       type: String,
        required: true,
         trim: true
         },
    area: {
       type: String,
        required: true, 
        trim: true
       },
    street: {
       type: String,
        required: true, 
        trim: true
       },
    building: {
       type: String, trim: true
       },
    apartment: {

      type: String,
       trim: true
       },
    postalCode: {
       type: String, 
       trim: true
       },
    isDefault: {
       type: Boolean, 
       default: false
       },
  },
  {
     timestamps: true },
);

module.exports = mongoose.model("Address", addressSchema);
