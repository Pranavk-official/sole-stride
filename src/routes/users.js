const express = require("express");
const router = express.Router();

const {cartList} = require('../middlewares/cartMiddleware')
const userController = require("../controller/userController");
const { isLoggedIn } = require("../middlewares/authMiddleware");
const orderController = require("../controller/orderController");

router.use(isLoggedIn,cartList,(req, res, next) => {
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
router.route("/address/add-address").post(userController.addAddress);
router.route("/address/edit-address/:id").get(userController.getAddress);
router.route("/address/delete-address/:id").post(userController.deleteAddress);



router.post("/place-order", orderController.placeOrder);

router.route("/orders").get(orderController.getUserOrders);
router.get("/order/:id", orderController.getUserOrder);
router.post("/cancel-order/:id", orderController.cancelOrder);
router.get("/wishlist", userController.getWishlist);

module.exports = router;
