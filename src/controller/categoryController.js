const fs = require("fs");

const layout = "./layouts/adminLayout.ejs";
const Category = require("../model/categorySchema");
const Product = require("../model/productSchema");

module.exports = {
  getAllCategory: async (req, res) => {
    const locals = {
      title: "Category Management",
    };
    const categories = await Category.find();
    res.render("admin/categories/categories", {
      locals,
      categories,
      layout,
    });
  },
  getCategoryDetails: async (req, res) => {
    const categoryId = req.params.id
    try {
      const category = await Category.findOne({_id: categoryId});
      
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      return res.status(200).json({
        success: true,
        category
      });
    } catch (error) {
      console.log("Error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    
  },
  getAddCategory: async (req, res) => {
    res.render("admin/categories/addCategory", {
      layout,
    });
  },
  getEditCategory: async (req, res) => {
    const category = await Category.findById(req.params.id);
    res.render("admin/categories/editCategory", {
      category,
      layout,
    });
  },
  addCategory: async (req, res) => {
    // console.log(req.body, req.files);
    try {
      const name = String(req.body.category_name).toLowerCase();
      const category = await Category.findOne({ name: name });
      if (category) {
        return res.json({ error: "Category Already Exist!!" });
      } else {
        // console.log(req.body, req.files);
        const newCategory = new Category({
          name: name,
          image: {
            filename: req.files.category_image[0].filename,
            originalname: req.files.category_image[0].originalname,
            path: req.files.category_image[0].path,
          },
        });
        const addCategory = newCategory.save();
        if (addCategory) {
          res.json({
            success: true,
          });
        }
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
  editCategory: async (req, res) => {
    try {
      const { status, imageName } = req.body;
      let name = req.body.name.toLowerCase();
      let editCategory = {
        name: name,
        isActive: status === "true" ? true : false,
      };

      if (req.files) {
        editCategory.image = {
          filename: req.files.category_image[0].filename,
          originalname: req.files.category_image[0].originalname,
          path: req.files.category_image[0].path,
        };

        // Deleting old image from the multer
        fs.unlink(`./public/uploads/category-images/${imageName}`, (err) => {
          if (err) {
            console.error(err); // Log the error instead of throwing it
          }
        });
      }

      // Update category details
      const id = req.params.id;
      const update_category = await Category.findByIdAndUpdate(
        id, // Directly use the id instead of { _id: id }
        editCategory,
        { new: true } // This option returns the updated document
      );

      if (update_category) {
        res.json({
          success: true,
          category: update_category, // Optionally return the updated category
        });
      } else {
        res.status(404).json({ success: false, message: "Category not found" });
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
  deleteCategory: async (req, res) => {
    const id = req.query.id;
    const image = req.query.image;

    try {
      // Check if the category is used by any product
      const productsUsingCategory = await Product.find({ category: id });

      if (productsUsingCategory.length > 0) {
        // If the category is used by any product, send a response indicating that the category is in use
        return res.status(400).json({
          success: false,
          message: "Category is in use by some products",
        });
      } else {
        // If the category is not used by any product, proceed to delete the category
        // delete banner image from file
        fs.unlink(`./public/uploads/category-images/${image}`, (err) => {
          if (err) throw err;
        });

        // deleting banner image from db
        const deleteCategory = await Category.findByIdAndDelete({ _id: id });
        if (deleteCategory) {
          res.json({
            success: true,
          });
        } else {
          res
            .status(404)
            .json({ success: false, message: "Category not found" });
        }
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to delete category" });
    }
  },
};
