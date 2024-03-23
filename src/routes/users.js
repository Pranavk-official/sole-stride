const express = require("express");
const router = express.Router();

const User = require("../model/userSchema");
const Cart = require("../model/cartSchema");
const WishList = require("../model/wishlistSchema");
const Order = require("../model/orderSchema");
const { isLoggedIn } = require("../middlewares/authMiddleware");
const userController = require("../controller/userController");
const orderController = require("../controller/orderController");
const reviewController = require("../controller/reviewController");
const checkoutController = require("../controller/checkoutController");

router.use(isLoggedIn, async (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return res.redirect("/admin");
  }

  // if (req.user) {
  //   res.locals.user = req.user;

  //   const cart = await Cart.find({ userId: req.user.id });
  //   res.locals.cartCount = cart && cart.items ? cart.items.length : 0;
    
  //   const userWishlist = await WishList.findOne({ userId: req.user.id });
  //   const userOrder = await Order.find({ customer_id: req.user.id }).countDocuments();

  //   res.locals.orderCount = userOrder;
  //   res.locals.wishlistCount = userWishlist ? userWishlist.products.length : 0;
  // }
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

router.post("/place-order", checkoutController.placeOrder);
router.post("/verify-payment", checkoutController.verifyPayment);

router.route("/orders").get(orderController.getUserOrders);
router.get("/order/:orderId", orderController.getSingleOrder);
router.post("/cancel-order/:id/:itemId/:variant", orderController.cancelOrder);
router.post("/return-order/", orderController.returnOrder);
router.post("/cancel-all-order/:id/", orderController.cancelAllOrders);

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

/**
 * User Wallet
 */

router.get("/wallet", userController.getWallet);
router.post('/add-to-wallet', userController.addToWallet)
router.post('/verify-wallet-payment', userController.verifyPayment)

/**
 * User Refferals
 */

router.get("/referrals", userController.getRefferals);


module.exports = router;
