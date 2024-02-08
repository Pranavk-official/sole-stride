const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const { registerValidation, loginValidation } = require("../validators/userValidator");
const { isVerified, isLoggedOut } = require("../middlewares/authMiddleware");
router
  .route("/login")
  .get(isLoggedOut, authController.getLogin)
  .post(isVerified, loginValidation, authController.userLogin);

router.get('/logout', authController.userLogout)
router.get('/admin/logout', authController.userLogout)

router
  .route("/register")
  .get(isLoggedOut, authController.getRegister)
  .post(registerValidation, authController.userRegister);

router
  .route("/verify-otp")
  .get(authController.getVerifyOtp)
  .post(authController.verifyOtp);


router
  .route("/resend-otp")
  .get(authController.resendOTP)

router
  .route("/forgot-password")
  .get(authController.getForgotPass);

router
  .route("/admin/login")
  .get(authController.getAdminLogin)
  .post(authController.adminLogin);

router
  .route("/admin/register")
  .get(authController.getAdminRegister)
  .post(registerValidation, authController.adminRegister);

module.exports = router;
