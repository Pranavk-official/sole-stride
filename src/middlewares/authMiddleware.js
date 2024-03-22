const User = require("../model/userSchema");
const OTP = require("../model/otpSchema");

const passport = require("../config/passport-config");

module.exports = {
  isLoggedIn: (req, res, next) => {
    // console.log(req.user, req.isAuthenticated());
    if (req.isAuthenticated() && !req.user.isAdmin) {
      next();
    } else {
      req.flash("error", "Please Login First");
      res.redirect("/login");
    }
  },
  isLoggedOut: (req, res, next) => {
    if (req.isAuthenticated()) {
      res.redirect("/");
    } else {
      next();
    }
  },

  isAdmin: (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin) {
      next();
    } else {
      res.redirect("/admin/login");
    }
  },
  isAdminLoggedOut: (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin) {
      res.redirect("/admin");
    } else {
      next();
    }
  },

  // Check Blocked status for users

  checkBlockedUser: async (req, res, next) => {
    
    if (req.isAuthenticated()) {
      // console.log('middleware');
      const user = await User.findOne({ _id: req.user.id });
      // console.log(user);
      if (user.isBlocked) {
        req.logout((err) => {
          if (err) {
            console.log(err);
          } else {
            req.flash("error", `User is blocked by the admin!!!!`);
            res.clearCookie("connect.sid");
            return res.redirect("/login");
          }
        });
      }
    }
    next()
  },
};
