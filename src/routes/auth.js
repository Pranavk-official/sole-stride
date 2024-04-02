const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const reportsController = require("../controller/reportsController");

const {
  registerValidation,
  loginValidation,
  forgotPassValidation,
  resetPassValidation,
} = require("../validators/userValidator");

const {
  isVerified,
  isLoggedOut,
  isAdminLoggedOut,
} = require("../middlewares/authMiddleware");

router.use((req,res,next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next()
})


router
  .route("/login")
  .get(isLoggedOut, authController.getLogin)
  .post(loginValidation, authController.userLogin);

router
  .route("/register")
  .get(isLoggedOut, authController.getRegister)
  .post(registerValidation, authController.userRegister);

router
  .route("/verify-otp")
  .get( isLoggedOut, authController.getVerifyOtp )
  .post(authController.verifyOtp);

router
  .route("/forgot-password/verify-otp")
  .get( isLoggedOut, authController.getForgotPassOtp )


router.route("/resend-otp").get(authController.resendOTP);

router
  .route("/forgot-password")
  .get(isLoggedOut, authController.getForgotPass)
  .post(forgotPassValidation, authController.forgotPass);

router
  .route("/reset-password")
  .get(isLoggedOut, authController.getResetPass)
  .post(resetPassValidation, authController.resetPass);

router
  .route("/admin/login")
  .get(isAdminLoggedOut, authController.getAdminLogin)
  .post(loginValidation, authController.adminLogin);

router
  .route("/admin/register")
  .get(isAdminLoggedOut, authController.getAdminRegister)
  .post(registerValidation, authController.adminRegister);

router.get("/logout", authController.userLogout);
router.get("/admin/logout", authController.adminLogout);


router.get('/admin/sales-report/pdf', reportsController.getSalesReportPdf)

module.exports = router;
