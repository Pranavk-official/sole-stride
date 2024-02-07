const { validationResult } = require("express-validator");

/**
 * Models
 */
const User = require("../model/userSchema");
// const OTP = require('../model/otpSchema')

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
      req.flash("error", "Admin Registration Unsuccessfull");
      return res.redirect("/register");
    } else {
      req.flash("success", "Admin Registered Successfully");
      return res.redirect("/login");
    }
  },
  userLogin: async (req, res) => {
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
  },
  /**
   * User Verification
   */
  getVerifyOtp: async (req, res) => {
    const locals = {
      title: "SoleStride - Register",
    };

    res.render("auth/user/verifyOtp", {
      locals,
      success: req.flash("success"),
      error: req.flash("error"),
    });
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

};
