const express = require('express');
const router = express.Router();
const shopController = require('../controller/shopController')


/* GET users listing. */
router.get('/', shopController.getHome);
router.get('/shop', shopController.getProductList);
router.get('/cart', shopController.getCart);
router.get('/checkout', shopController.getCheckout);
router.get('/contact', shopController.getContact);
router.get('/product', shopController.getProduct);
// router.get('/productTest', shopController.getProductTest);

module.exports = router;
