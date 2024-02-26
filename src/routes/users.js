const express = require("express");
const router = express.Router();

const User = require("../model/userSchema");
const Order = require("../model/orderSchema");
const { isLoggedIn } = require("../middlewares/authMiddleware");
const userController = require("../controller/userController");
const orderController = require("../controller/orderController");

router.use(isLoggedIn, async (req, res, next) => {
  if (req.user) {
    res.locals.user = req.user;
    res.locals.cartCount = req.user.cart.length;

    const userOrder = await Order.find({customer_id: req.user.id}).countDocuments()

    res.locals.orderCount = userOrder
  }
  next();
});

/**
 * User Profile
 */

router
  .route("/profile")
  .get(userController.getProfile)
  .post(userController.editProfile);

router.route("/reset-password").post(userController.resetPass);

/**
 * User Address
 */

router.route("/address").get(userController.getAddress);
router.route("/address/add-address").post(userController.addAddress);

router
  .route("/address/edit-address/:id")
  .get(userController.getEditAddress)
  .post(userController.editAddress)
  .delete(userController.deleteAddress);

router
  .route("/address/delete-address/:id")
  .delete(userController.deleteAddress);

/**
 * User Order Management
 */

router.post("/place-order", orderController.placeOrder);

router.route("/orders").get(orderController.getUserOrders);
router.get("/order/:id", orderController.getUserOrder);
router.post("/cancel-order/:id", orderController.cancelOrder);

/**
 * User Wishlist
 */

router.get("/wishlist", userController.getWishlist);

module.exports = router;
