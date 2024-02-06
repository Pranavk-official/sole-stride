const express = require('express');
const router = express.Router();

const userController = require('../controller/userController');

router.get('/profile', userController.getProfile);
router.get('/address', userController.getAddress);
router.get('/orders', userController.getOrders);
router.get('/order', userController.getOrder);
router.get('/wishlist', userController.getWishlist);

module.exports = router;
