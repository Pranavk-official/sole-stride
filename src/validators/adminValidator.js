const { checkSchema, validationResult } = require("express-validator");
const Category = require("../model/categorySchema");

module.exports = {
  categoryValidation: checkSchema({
    name: {
      isAlpha: {
        errorMessage: "Category name should contain only letters",
      },
      custom: {
        options: async (value) => {
          // Replace this with your actual logic to check if the category exists in the database
          const exists = await checkIfCategoryExists(value);
          if (exists) {
            throw new Error("Category already exists");
          }
          return true;
        },
      },
    },
    description: {
      trim: true,
      escape: true,
      isLength: {
        errorMessage: "Description must be at least  5 characters long",
        options: { min: 5 },
      },
      exists: {
        errorMessage: "Description is required",
      },
    },
  }),
};
