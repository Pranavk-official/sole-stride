const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    filename: String,
    originalname: String,
    path: String,
  },
  description: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  onOffer: {
    type: Boolean,
    default: false,
  },
  offerDiscountRate: {
    type: Number,
    min: 0,
    default: 0,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("Category", categorySchema);
