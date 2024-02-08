const { validationResult } = require("express-validator");
const passport = require("passport");
const bcrypt = require('bcrypt')

/**
 * Models
 */
const User = require("../model/userSchema");
const OTP = require("../model/otpSchema");
const { sendOtpEmail } = require("../helpers/userVerificationHelper");
const { isVerified } = require("../middlewares/authMiddleware");

const adminLayout = "./layouts/adminLayout";

module.exports = {
  getAdminLogin: async (req, res) => {
    const locals = {
      title: "SoleStride - Login",
    };

    res.render("auth/admin/login", {
      locals,
      layout: adminLayout,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  },
  getAdminRegister: async (req, res) => {
    const locals = {
      title: "SoleStride - Login",
    };

    res.render("auth/admin/register", {
      locals,
      layout: adminLayout,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  },
  adminRegister: async (req, res) => {
    // console.log(req.body);
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      req.flash(
        "error",
        errors.array().map((err) => err.msg)
      );
      // return res.status(422).json({ errors: errors.array() });
      return res.redirect("/admin/register");
    }

    const { username, firstName, lastName, email, password, confirmPassword } =
      req.body;

    if (password !== confirmPassword) {
      req.flash("error", "Passwords do not match");
      return res.redirect("/admin/register");
    }

    // Check if the username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      req.flash("error", "Username or email already exists");
      return res.redirect("/admin/login");
    }

    const user = new User({
      username,
      firstName,
      lastName,
      email,
      password,
      isAdmin: true,
    });

    let savedUser = await user.save();

    if (!savedUser) {
      req.flash("error", "Admin Registration Unsuccessfull");
      return res.redirect("/admin/register");
    } else {
      req.flash("success", "Admin Registered Successfully");
      return res.redirect("/admin/login");
    }
  },
  adminLogin: async (req, res) => {
    console.log(req.body);
    passport.authenticate("admin-local", (err, user, info) => {
      if (err) {
        console.log(err);
        return next(err);
      }
      if (!user) {
        console.log(info);
        req.flash("error", "Invalid Credentials!!!");
        return res.redirect("/admin/login");
      }
      req.logIn(user, (err) => {
        if (err) {
          console.log(err);
          return next(err);
        }
        req.flash("success", "Admin Logged In");
        return res.redirect("/admin");
      });
    })(req, res, next);
  },
  /**
   * User Registrationand Authentication
   */
  getLogin: async (req, res) => {
    const locals = {
      title: "SoleStride - Login",
    };

    res.render("auth/user/login", {
      locals,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  },
  getRegister: async (req, res) => {
    const locals = {
      title: "SoleStride - Register",
    };

    res.render("auth/user/register", {
      locals,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  },
  userRegister: async (req, res) => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      req.flash(
        "error",
        errors.array().map((err) => err.msg)
      );
      // return res.status(422).json({ errors: errors.array() });
      return res.redirect("/register");
    }

    const { username, firstName, lastName, email, password, confirmPassword } =
      req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      req.flash("error", "Email already in use");
      return res.redirect("/register");
    }

    if (password !== confirmPassword) {
      req.flash("error", "Passwords do not match");
      return res.redirect("/register");
    }

    const user = new User({
      username,
      firstName,
      lastName,
      email,
      password,
    });

    let savedUser = await user.save();

    if (!savedUser) {
      req.flash("error", "User Registration Unsuccessfull");
      return res.redirect("/register");
    } else {
      req.session.verifyToken = savedUser._id;

      const isOtpSent = sendOtpEmail(savedUser, res);

      if (isOtpSent) {
        req.flash(
          "success",
          "User Registered Successfully, Please verify your email!!!!!"
        );
        return res.redirect("/verify-otp");
      } else {
        req.flash("error", "User verification falied try again by loggin in");
        res.redirect("/login");
      }

      // return res.redirect("/login");
    }
  },
  userLogin: async (req, res, next) => {
    console.log(req.user);

    const user = await User.findOne({ email: req.body.email, isAdmin: false });

    if (user) {
      if (user.isBlocked) {
        req.flash("error", "You are blocked by the admin!!!!!!");
        return res.redirect("/login");
      }

      if (!user.isVerified) {
        if (!req.session.verifyToken) {
          req.session.verifyToken = user._id;
        }
        const isOtpSent = sendOtpEmail(user, res);

        if (isOtpSent) {
          req.flash(
            "success",
            "OTP send to email, Please verify your email!!!!!"
          );
          return res.redirect("/verify-otp");
        } else {
          req.flash("error", "User verification falied try again by loggin in");
          return res.redirect("/login");
        }

      } else {
        passport.authenticate("user-local", (err, user, info) => {
          if (err) {
            console.log(err);
            return next(err);
          }
          if (!user) {
            console.log(info);
            req.flash("error", info.message);
            return res.redirect("/login");
          }
          req.logIn(user, (err) => {
            if (err) {
              console.log(err);
              return next(err);
            }
            return res.redirect("/");
          });
        })(req, res, next);
      }
    } else {
      req.flash('error', 'Invalid Credentials')
      return res.redirect('/loginz')
    }

  },
  /**
   * User Verification
   */
  getVerifyOtp: async (req, res) => {
    const locals = {
      title: "SoleStride - Register",
    };

    if (req.user || !req.session.verifyToken) {
      return res.redirect("/");
    }

    res.render("auth/user/verifyOtp", {
      locals,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  },
  verifyOtp: async (req, res) => {
    console.log(req.body);
    const { val1, val2, val3, val4, val5, val6 } = req.body;
    const otp = val1 + val2 + val3 + val4 + val5 + val6;

    if (req.session.verifyToken) {
      const otpVerifyData = await OTP.findOne({
        userId: req.session.verifyToken,
      });

      if (otpVerifyData) {
        if (await bcrypt.compare(otp, otpVerifyData.otp)) {
          const updateUser = await User.updateOne(
            { _id: req.session.verifyToken },
            {
              $set: { isVerified: true },
            }
          );

          if (updateUser) {
            req.flash("success", "User verificaion successfull, Please Login");
            console.log('success');
            delete req.session.verifyToken;
            return res.redirect("/login");
          }
        } else {
          req.flash("error", "Please enter a valid OTP!!!!!!");
          console.log('errorr, otp not valid');
          return res.redirect("/verify-otp");
        }
      } else {
        req.flash("error", "OTP expired, Try again by logging in!!!!!!");
        console.log('errorr, otp expired');
        return res.redirect("/login");
      }
    } else {
      req.flash(
        "error",
        "Session Timeout, OTP verification failed, Try again by logging in!!!!!!"
        );
        console.log('errorr, otp verify faild');
      return res.redirect("/login");
    }
  },

  resendOTP: async (req, res) => {
    try {
      if (req.user || !req.session.verifyToken) {
        return res.status(500).json({ "success": false, 'message': "Error: Session Time Out Try Again !" });
      }
      const userId = req.session.passwordResetToken ? req.session.passwordResetToken : req.session.verificationToken;
      
      const user = await User.findOne({_id: userId, isAdmin: false, isBlocked: false })
      const otpSend = await sendOtpEmail(user,res)
      if (otpSend) {
        return res.status(201).json({ "success": true });
      }
      
      return res.status(500).json({ "success": false, 'message': "Server facing some issues try again !" });
    } catch (error) {
      return res.status(500).json({ "success": false, 'message': `${error}` });
    }
  },

  getForgotPass: async (req, res) => {
    const locals = {
      title: "SoleStride - Forgot Password",
    };
    res.render("auth/user/forgotPassword", {
      locals,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  },

  userLogout: async (req, res) => {
    req.logOut((err) => {
      if (err) {
        console.log(err);
      } else {
        req.flash("success", `Logged Out!!`);
        res.clearCookie("connect.sid");
        res.redirect("/login");
      }
    });
  },
};
