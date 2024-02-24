const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      expires:  300, //  300 seconds =  5 minutes
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create an index on the `expiresAt` field to enable TTL
otpSchema.index({ expiresAt:  1 }, { expireAfterSeconds:  0 });

module.exports = mongoose.model("OtpData", otpSchema);
