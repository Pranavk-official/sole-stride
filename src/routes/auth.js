const express = require('express');
const router = express.Router();
const authController = require('../controller/authController')

router.get('/login', authController.getLogin);
router.get('/register', authController.getRegister);
router.get('/verify-otp', authController.getVerifyOtp);
router.get('/forgot-password', authController.getForgotPass);

module.exports = router;