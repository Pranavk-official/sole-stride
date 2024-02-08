const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const { registerValidation } = require("../validators/userValidator");
const { isVerified, isLoggedOut } = require("../middlewares/authMiddleware");
router
  .route("/login")
  .get(isLoggedOut, authController.getLogin)
  .post(authController.userLogin);

router
  .route("/register")
  .get(isLoggedOut, authController.getRegister)
  .post( registerValidation, authController.userRegister);

router.get("/verify-otp", authController.getVerifyOtp);
router.get("/forgot-password", authController.getForgotPass);

router
  .route("/admin/login")
  .get(authController.getAdminLogin)
  .post(authController.adminLogin);

router
  .route("/admin/register")
  .get(authController.getAdminRegister)
  .post(registerValidation, authController.adminRegister);

module.exports = router;
