const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Product = require("./productSchema");
const Coupon = require("./couponSchema");



const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    items: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        variant: {
          type: mongoose.Schema.Types.ObjectId,
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
        quantity: {
          type: Number,
          required: true,
          min: [1, `Quantity Can't be less than 1`],
        },
        price: {
          type: Number,
        },
        itemTotal: {
          type: Number,
        },
      },
    ],
    totalPrice: {
      type: Number,
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },
    couponDiscount: {
      type: Number,
      default: 0,
    },
    payable: {
      type: Number,
    },
  },
  { timestamps: true }
);

// cartSchema.pre("save", async function (next) {
//   // Initialize totalPrice to 0
//   this.totalPrice = 0;

//   for (const item of this.items) {
//     item.price = item.product_id.onOffer ? item.product_id.offerDiscountPrice : item.product_id.sellingPrice;
//     const itemTotalPrice = item.price * item.quantity;
//     item.itemTotal = itemTotalPrice;
//     this.totalPrice += itemTotalPrice;
//   }

//   this.payable = this.totalPrice

//   // Check if a coupon is applied
//   if (this.coupon) {
//     // Assuming you have a method to fetch the coupon details
//     // and calculate the discount based on the total price
//     const coupon = await Coupon.findById(this.coupon);
//     if (coupon) {
//       // Apply the coupon discount to the total price
//       // This is a simple example, adjust according to your coupon logic
//       this.couponDiscount = this.totalPrice * (coupon.discountPercentage / 100);
//       this.payable -= this.couponDiscount;
//     }
//   } else {
//     // If no coupon, reset the couponDiscount to 0
//     this.couponDiscount = 0;
//   }

//   // Continue with the save operation
//   next();
// });

cartSchema.statics.clearCart = async function (userId) {
  return await this.findOneAndUpdate(
    { userId: userId },
    {
      $set: {
        items: [],
        totalPrice: 0,
        coupon: null,
        couponDiscount: 0,
        payable: 0,
      },
    },
    { new: true }
  );
};

module.exports = mongoose.model("Cart", cartSchema);
