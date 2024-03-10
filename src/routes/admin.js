const express = require("express");
const router = express.Router();

const adminController = require("../controller/adminController");
const categoryController = require("../controller/categoryController");
const bannerController = require("../controller/bannerController");
const productController = require("../controller/productController");

const { categoryValidation } = require("../validators/adminValidator");

const { isAdmin } = require("../middlewares/authMiddleware");

const {
  categoryUpload,
  bannerUpload,
  productUpload,
} = require("../middlewares/multer");

const orderController = require("../controller/orderController");
const attributeController = require("../controller/attributeController");

/* Common Midleware for admin routes*/
router.use(isAdmin, (req, res, next) => {
  if (req.user.isAdmin) {
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
  .route("/category/delete-category/")
  .get(categoryController.deleteCategory);

/**
 * Product Management
 */

router.route("/products").get(productController.getAllProducts);
router.get("/stocks", productController.getStocks);
router.patch("/update-stock/", productController.updateStock);

router
  .route("/products/add-product")
  .get(productController.getAddProduct)
  .post(
    productUpload.fields([{ name: "images" }, { name: "primaryImage" }]),
    productController.addProduct
  );

router
  .route("/products/edit-product/:id")
  .get(productController.getEditProduct)
  .post(
    productUpload.fields([{ name: "images" }, { name: "primaryImage" }]),
    productController.editProduct
  );

// list/unlist product

router.patch("/products/toggle-listing/:id", productController.toggleListing);

// Product Delete
router.delete("/products/delete-product/:id", productController.deleteProduct);

// Product Image Delete
router.delete("/products/delete-image/", productController.deleteImage);

/**
 * Attribute Management
 */

router.get("/attributes", attributeController.getAttributes);

router
  .route("/attributes/color/:id")
  .get(attributeController.getColor)
  .put(attributeController.editColor);

router
  .route("/attributes/size/:id")
  .get(attributeController.getSize)
  .put(attributeController.editSize);

router
  .route("/attributes/brand/:id")
  .get(attributeController.getBrand)
  .put(attributeController.editBrand);

router
  .route("/attributes/toggleListing/color/:id")
  .patch(attributeController.toggleListingColor);

router
  .route("/attributes/toggleListing/size/:id")
  .patch(attributeController.toggleListingSize);

router
  .route("/attributes/toggleListing/brand/:id")
  .patch(attributeController.toggleListingBrand);

router
  .route("/attributes/delete-color/:id")
  .delete(attributeController.deleteColor);

router
  .route("/attributes/delete-size/:id")
  .delete(attributeController.deleteSize);

router
  .route("/attributes/delete-brand/:id")
  .delete(attributeController.deleteBrand);

router.post("/attributes/add-color", attributeController.addColor);
router.post("/attributes/add-size", attributeController.addSize);
router.post("/attributes/add-brand", attributeController.addBrand);

/**
 * Customer Management
 */

router.route("/users").get(adminController.getUsersList);

router.route("/users/toggle-block/:id").patch(adminController.toggleBlock);

/**
 * Order Management
 */

router.route("/orders").get(orderController.getOrders);
router.route("/orders/manage-order/:id").get(orderController.getOrderDetails);
router
  .route("/orders/manage-order/changeStatus/:id")
  .post(orderController.changeOrderStatus);

module.exports = router;
