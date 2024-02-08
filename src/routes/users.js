const express = require('express');
const router = express.Router();

const userController = require('../controller/userController');
const { isLoggedIn } = require('../middlewares/authMiddleware')

router
    .route('/profile')
    .all(isLoggedIn)
    .get(userController.getProfile)
    .post(userController.editProfile)

router.route('/address')
    .all(isLoggedIn)
    .get(userController.getAddress);

// router.route('/cart')
//     .all(isLoggedIn)
//     .get(userController.getAddress);

router
    .route('/orders')
    .get(userController.getOrders);
router.get('/order', userController.getOrder);
router.get('/wishlist', userController.getWishlist);

module.exports = router;
