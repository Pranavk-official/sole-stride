const express = require("express");
const router = express.Router();
const shopController = require("../controller/shopController");
const cartController = require("../controller/cartController");

const {
  isLoggedIn,
} = require("../middlewares/authMiddleware");

const { cartList } = require("../middlewares/cartMiddleware");
const userController = require("../controller/userController");

router.use((req, res, next) => {
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
    res.locals.cartCount = req.user.cart.length;
  }
  // res.locals.success = req.flash("success");
  // res.locals.error = req.flash("error");
  next();
});

router.get("/", shopController.getHome);
router.get("/shop", shopController.getProductList);
router.get("/shop/product/:id", shopController.getProduct);

router.get("/search", shopController.search)



router.get("/user/cart", isLoggedIn, cartController.getCart);
router.get("/shop/order-success", cartController.getOrderSuccess);

router.post("/user/add-to-cart/", cartController.addToCart);

router.get(
  "/cart/remove-from-cart/:id/:variant",
  cartController.removeCartItem
);
router.get(
  "/cart/increase-quantity/:id/:variant",
  cartController.incrementCartItem
);
router.get(
  "/cart/decrease-quantity/:id/:variant",
  cartController.decrementCartItem
);

router.get("/checkout", shopController.getCheckout);
router.post("/checkout/add-address", shopController.addAddress);

router
  .route("/checkout/edit-address/:id")
  .get(userController.getEditAddress)
  .post(shopController.editAddress)
  .delete(shopController.deleteAddress);

router.get("/contact", shopController.getContact);
// router.get('/productTest', shopController.getProductTest);

module.exports = router;
