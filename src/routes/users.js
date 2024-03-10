const express = require("express");
const router = express.Router();

const User = require("../model/userSchema");
const WishList = require("../model/wishlistSchema");
const Order = require("../model/orderSchema");
const { isLoggedIn } = require("../middlewares/authMiddleware");
const userController = require("../controller/userController");
const orderController = require("../controller/orderController");
const reviewController = require("../controller/reviewController");

router.use(isLoggedIn, async (req, res, next) => {
  if(req.user && req.user.isAdmin){
    return res.redirect('/admin')
  }

  if (req.user) {
    res.locals.user = req.user;
    res.locals.cartCount = req.user.cart.length;

    const userWishlist = await WishList.findOne({userId: req.user.id})
    const userOrder = await Order.find({customer_id: req.user.id}).countDocuments()
    
    const wishlistCount = userWishlist.products.length

    res.locals.orderCount = userOrder
    res.locals.wishlistCount = wishlistCount
  }
  // res.locals.success = req.flash("success");
  // res.locals.error = req.flash("error");
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
router.post("/add-to-wishlist", userController.addToWishlist);
router.delete("/remove-from-wishlist", userController.removeFromWishlist);


/**
 * User Review
 */
router.post("/add-review", reviewController.postReview);

module.exports = router;
