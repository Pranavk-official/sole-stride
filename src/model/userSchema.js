const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    profileImg: {
      type: String,
    },
    cart: [
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
        itemTotal: {
          type: Number,
        },
        price: {
          type: Number,
        },
      },
    ],
    wishlist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WishList",
    },
    username: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
    },
    joined_date: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    referralCode: {
      type: String,
      unique: true,
    },
    referralToken: {
      type: String,
      unique: true,
    },
    successfullRefferals: [{
      date: {
        type: Date,
        default: Date.now,
      },
      username: {
        type: String,
      },
      status: {
        type: String,
      }
    }],
    refferalRewards: {
      type: Number,
      default: 0,
      min: 0,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model("User", userSchema);
