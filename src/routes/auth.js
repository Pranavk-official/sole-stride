const express = require('express');
const router = express.Router();
const authController = require('../controller/authController')
const { registerValidation } = require('../validators/userValidator')

router.get('/login', authController.getLogin);
router.get('/register', authController.getRegister);
router.get('/verify-otp', authController.getVerifyOtp);
router.get('/forgot-password', authController.getForgotPass);

router.route('/admin/login')
    .get(authController.getAdminLogin)
    .post(authController.adminLogin)

    router.route('/admin/register')
    .get(authController.getAdminRegister)
    .post(registerValidation, authController.adminRegister)

module.exports = router;