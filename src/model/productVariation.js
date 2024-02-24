const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const variationSchema = new Schema(
  {
    product_id: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProductVariation', variationSchema)