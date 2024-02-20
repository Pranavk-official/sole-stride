const express = require("express");
const router = express.Router();
const shopController = require("../controller/shopController");
const cartController = require("../controller/cartController");
const { isLoggedIn, checkBlockedUser } = require("../middlewares/authMiddleware");
const { cartList } = require("../middlewares/cartMiddleware");

router.use(cartList,(req, res, next) => {
  if (req.user) {
    res.locals.user = req.user;
    res.locals.cartCount = req.user.cart.length
  }
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  next()
});
/* GET users listing. */
router.get("/", shopController.getHome);
router.get("/shop", shopController.getProductList);
router.get("/cart", checkBlockedUser,cartController.getCart);
router.get("/shop/order-success", cartController.getOrderSuccess);
router.get("/cart/add-to-cart/:id", cartController.addToCart);
router.get("/cart/remove-from-cart/:id", cartController.removeCartItem);
router.get("/cart/increase-quantity/:id", cartController.incrementCartItem);
router.get("/cart/decrease-quantity/:id", cartController.decrementCartItem);
router.get("/checkout", shopController.getCheckout);
router.post("/checkout/add-address", shopController.addAddress);

router.get("/contact", shopController.getContact);
router.get("/shop/product/:id", shopController.getProduct);
// router.get('/productTest', shopController.getProductTest);

module.exports = router;
