const express = require("express");
const router = express.Router();

const userController = require("../controller/userController");
const { isLoggedIn } = require("../middlewares/authMiddleware");

router.use(isLoggedIn,(req, res, next) => {
  if (req.user) {
    res.locals.user = req.user;
    res.locals.cartCount = req.user.cart.length 
  }
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  next()
});

router.get('/cart', (req,res) => {
  res.redirect('/cart')
})

router
  .route("/profile")
  .get(userController.getProfile)
  .post(userController.editProfile);

router
  .route("/reset-password")
  .post(userController.resetPass);

router.route("/address").get(userController.getAddress);

// router.route('/cart')
//     .get(userController.getAddress);

router.route("/orders").get(userController.getOrders);
router.get("/order", userController.getOrder);
router.get("/wishlist", userController.getWishlist);

module.exports = router;
