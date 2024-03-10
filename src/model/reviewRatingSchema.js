const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

// review and Rating
let reviewSchema = new Schema(
  {
    user_id: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    product_id: {
      type: ObjectId,
      ref: "Product",
      required: true,
    },
    variant: {
      type: ObjectId,
      ref: "product.variants",
      required: true,
    },
    color: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Color",
    },
    size: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Size",
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Review", reviewSchema);
