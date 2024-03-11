const express = require('express');
const router = express.Router();

const cartController = require('../controller/cartController')
const shopController = require('../controller/shopController')

const {} = require('../middlewares/authMiddleware')

router.get("/cart", isLoggedIn, cartController.getCart);
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

module.exports = router;
