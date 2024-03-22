const mongoose = require("mongoose");
const { Schema, ObjectId } = mongoose;
const productSchema = new Schema(
  {
    product_name: {
      type: String,
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    primary_image: {
      name: {
        type: String,
      },
      path: {
        type: String,
      },
    },
    secondary_images: [
      {
        name: {
          type: String,
        },
        path: {
          type: String,
        },
      },
    ],
    variants: [
      {
        color: {
          type: ObjectId, // Reference to Color object ID
          ref: "Color", // Reference to the 'Color' model
          required: true,
        },
        size: {
          type: ObjectId, // Reference to Size object ID
          ref: "Size", // Reference to the 'Size' model
          required: true,
        },
        stock: {
          type: Number,
          required: true,
        },
      },
    ],
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    price: {
      type: Number,
    },
    actualPrice: {
      type: Number,
      required: true,
    },
    sellingPrice: {
      type: Number,
      required: true,
    },
    onOffer: {
      type: Boolean,
      default: false,
    },
    offerDiscountPrice: {
      type: Number,
      min: 0,
      default: 0
    },
    offerDiscountRate: {
      type: Number,
      min: 0,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

module.exports = mongoose.model("Product", productSchema);
