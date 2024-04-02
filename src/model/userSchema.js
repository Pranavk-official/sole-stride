const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const ObjectId = mongoose.Schema.Types.ObjectId;

const userSchema = new mongoose.Schema(
  {
    // if profile image is providing
    profileImg: {
      type: String,
    },
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
    },
    referralToken: {
      type: ObjectId,
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
