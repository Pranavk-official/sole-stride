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
}, {
  timestamps: true
});

module.exports = mongoose.model("Category", categorySchema);
