const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const orderSchema = new Schema(
  {
    customer_id: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product_id: {
          type: ObjectId,
          ref: "Product",
          required: true,
        },
        variant: {
          type: ObjectId,
          ref: "Product.variants", // Corrected ref path
          required: true,
        },
        color: {
          type: ObjectId,
          ref: "Color",
        },
        size: {
          type: ObjectId,
          ref: "Size",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, `Quantity Can't be less than 1`],
        },
        price: {
          type: Number,
          required: true,
        },
        itemTotal: {
          type: Number,
        },
        orderID: {
          type: String,
          unique: true,
        },
        status: {
          type: String,
        },
        returnReason: {
          type: String,
        },
        shipped_on: {
          type: Date,
        },
        out_for_delivery: {
          type: Date,
        },
        delivered_on: {
          type: Date,
        },
        cancelled_on: {
          type: Date,
        },
      },
    ],
    shippingAddress: {
      type: ObjectId,
      ref: "Address",
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    coupon: {
      type: ObjectId,
      ref: "Coupon",
    },
    couponDiscount: {
      type: Number,
      default: 0,
    },
    payable: {
      type: Number,
    },
    categoryDiscount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "cod", "failed", "refunded", "cancelled"],
      // required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("Order", orderSchema);
