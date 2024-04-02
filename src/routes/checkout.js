const express = require("express");
const router = express.Router();

const shopController = require("../controller/shopController");
const cartController = require("../controller/cartController");
const userController = require("../controller/userController");

const { isLoggedIn } = require('../middlewares/authMiddleware');
const checkoutController = require("../controller/checkoutController");
const couponController = require("../controller/couponController");

router.use(isLoggedIn,(req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
    // res.locals.cartCount = req.user.cart.length;
  }
  // res.locals.success = req.flash("success");
  // res.locals.error = req.flash("error");
  next();
});



router.get("/", checkoutController.getCheckout);

router.post("/verify-coupon", couponController.applyCoupon);
router.post("/remove-coupon", couponController.removeCoupon);

router.post("/add-address", shopController.addAddress);

router
  .route("/edit-address/:id")
  .get(userController.getEditAddress)
  .post(shopController.editAddress)


router.post('/verify-payment', checkoutController.verifyPayment)

// router.get("/order-success", cartController.getOrderSuccess);

module.exports = router;