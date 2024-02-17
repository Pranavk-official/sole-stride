const express = require("express");
const router = express.Router();

const adminController = require("../controller/adminController");
const categoryController = require("../controller/categoryController");
const bannerController = require("../controller/bannerController");
const productController = require("../controller/productController");

const { categoryValidation } = require("../validators/adminValidator");

const { isAdmin } = require("../middlewares/authMiddleware");
const { categoryUpload, bannerUpload, productUpload } = require("../middlewares/multer");

/* Common Midleware for admin routes*/
router.use(isAdmin, (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    res.locals.admin = req.user;
  }
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

router.get("/", adminController.getDashboard);

/**
 * Banner Management
 */

router.route("/banners").get(bannerController.getAllBanner);

router
  .route("/banners/add-banner")
  .get(bannerController.getAddBanner)
  .post(
    bannerUpload.fields([{ name: "banner_image" }]),
    bannerController.addBanner
  );

router
  .route("/banners/edit-banner/:id")
  .get(bannerController.getEditBanner)
  .post(
    bannerUpload.fields([{ name: "banner_image" }]),
    bannerController.editBanner
  );

router.route("/banners/delete-banner").get(bannerController.deleteBanner);

/**
 * Category Management
 */

router.route("/category").get(categoryController.getAllCategory);

router
  .route("/category/add-category")
  .get(categoryController.getAddCategory)
  .post(
    categoryValidation,
    categoryUpload.fields([{ name: "category_image" }]),
    categoryController.addCategory
  );

router
  .route("/category/edit-category/:id")
  .get(categoryController.getEditCategory)
  .post(
    categoryValidation,
    categoryUpload.fields([{ name: "category_image" }]),
    categoryController.editCategory
  );

router
  .route("/category/delete-category")
  .get(categoryController.deleteCategory);

/**
 * Product Management
 */

router.route("/products")
    .get(productController.getAllProducts)


router.route("/products/add-product")
    .get(productController.getAddProduct)
    .post(productUpload.fields([{name:"images"},{name:"primaryImage"}]),productController.addProduct)

router.route("/products/edit-product/:id")
    .get(productController.getEditProduct)
    .post(productUpload.fields([{name:"images"},{name:"primaryImage"}]),productController.editProduct)
    
/**
 * Customer Management
 */

router.route("/users").get(adminController.getUsersList);

/**
 * Order Management
 */

router.route("/orders");

module.exports = router;
