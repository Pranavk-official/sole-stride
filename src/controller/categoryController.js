const fs = require("fs");

const layout = "./layouts/adminLayout.ejs";
const Category = require("../model/categorySchema");

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
    const name = String(req.body.category_name).toLowerCase()
    const category = await Category.findOne({ name: name });
    if (category) {
      return res.json({'error': "Category Already Exist!!"})
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
  },
  editCategory: async (req, res) => {
    try {
      const { status, imageName } = req.body;

      // console.log(req.body);
    let name = req.body.name.toLowerCase()
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

      //deleting old image from the multer
      fs.unlink(`./public/uploads/category-images/${imageName}`, (err) => {
        if (err) {
          throw err
        };
      });
    }
    // update banner deatails
    const id = req.params.id;
    const update_category = await Category.findByIdAndUpdate(
      { _id: id },
      editCategory,
      { new: true }
    );

    if (update_category) {
      res.json({
        success: true,
      });
    }
    } catch (error) {
      console.error(error.message); 
    }
  },
  deleteCategory: async (req, res) => {
    const id = req.query.id;
    const image = req.query.image;
    // delete banner image from file
    fs.unlink(`./public/uploads/category-images/${image}`, (err) => {
      if (err) throw err;
    });

    // deleteing banner image from db
    const deleteCategory = await Category.findByIdAndDelete({ _id: id });
    if (deleteCategory) {
      res.json({
        success: true,
      });
    }
  },
};
