const { checkSchema, validationResult } = require("express-validator");
const User = require("../model/userSchema");

// custom validator to check if username already exists
const usernameExists = async (value) => {
  const user = await User.findOne({ username: value });
  if (user) {
    throw new Error("Username is already taken");
  }

  return true;
};
const emailExists = async (value) => {
  const user = await User.findOne({ email: value });
  if (user) {
    throw new Error("Email is already in use");
  }

  return true;
};

module.exports = {
  registerValidation: checkSchema({
    username: {
      trim: true,
      escape: true,
      errorMessage: "Username is required",
      exists: {
        errorMessage: "Username is required",
      },
      isLength: {
        errorMessage: "Username must be between   3 and   30 characters long",
        options: { min: 3, max: 30 },
      },
      custom: {options: usernameExists},
    },
    firstName: {
      trim: true,
      escape: true,
      errorMessage: "First name is required",
      exists: {
        errorMessage: "First name is required",
      },
      isLength: {
        errorMessage: "First name must be between   2 and   30 characters long",
        options: { min: 2, max: 30 },
      },
    },
    lastName: {
      trim: true,
      escape: true,
      errorMessage: "Last name is required",
      exists: {
        errorMessage: "Last name is required",
      },
      isLength: {
        errorMessage: "Last name must be between  1 and   30 characters long",
        options: { min: 1, max: 30 },
      },
    },
    email: {
      trim: true,
      normalizeEmail: true,
      errorMessage: "Enter a valid email address",
      exists: {
        errorMessage: "Email is required",
      },
      isEmail: true,
      custom: {options: emailExists},
    },
    password: {
      trim: true,
      escape: true,
      errorMessage: "Password must be at least 8 characters long",
      exists: {
        errorMessage: "Password is required",
      },
      isLength: {
        errorMessage: "Password must be at least 8 characters long",
        options: { min: 8 },
      },
    },
    confirmPassword: {
      trim: true,
      escape: true,
      errorMessage: "Confirm password is required",
      exists: {
        errorMessage: "Confirm password is required",
      },
      isLength: {
        errorMessage: "Confirm password must be at least 8 characters long",
        options: { min: 8 },
      },
    },
  }),
};
