const { validationResult } = require("express-validator");
const passport = require("passport");
const bcrypt = require("bcrypt");

const Wallet = require("../model/walletSchema");

/**
 * Models
 */
const User = require("../model/userSchema");
const OTP = require("../model/otpSchema");
const { sendOtpEmail } = require("../helpers/userVerificationHelper");

function generateRefferalCode(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let referralCode = "";
  for (let i = 0; i < length; i++) {
    referralCode += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return referralCode;
}

const adminLayout = "./layouts/adminLayout";

module.exports = {
  /**
   * Admin Authentication
   */
  getAdminLogin: async (req, res) => {
    const locals = {
      title: "SoleStride - Login",
    };

    res.render("auth/admin/login", {
      locals,
      layout: "./layouts/authLayout",
    });
  },
  getAdminRegister: async (req, res) => {
    const locals = {
      title: "SoleStride - Login",
    };

    res.render("auth/admin/register", {
      locals,
      layout: "./layouts/authLayout",
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
      isVerified: true,
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
  adminLogin: async (req, res, next) => {
    // console.log(req.body);
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
   * User Registration and Authentication
   */
  getLogin: async (req, res) => {
    if (req.session.verifyToken) {
      delete req.session.verifyToken;
    }
    console.log(req.session);
    const locals = {
      title: "SoleStride - Login",
    };

    res.render("auth/user/login", {
      locals,
    });
  },
  getRegister: async (req, res) => {
    if (req.session.verifyToken) {
      delete req.session.verifyToken;
    }

    const locals = {
      title: "SoleStride - Register",
    };

    console.log(req.query);

    if (req.query.ref) {
      locals.referralCode = req.query.ref;
    }

    res.render("auth/user/register", {
      locals,
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

    console.log(req.body);

    const {
      username,
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      referral,
    } = req.body;

    // const existingUser = await User.findOne({ email });

    // if (existingUser) {
    //   req.flash("error", "Email already in use");
    //   return res.redirect("/register");
    // }

    if (password !== confirmPassword) {
      req.flash("error", "Passwords do not match");
      return res.redirect("/register");
    }
    let referralCode = generateRefferalCode(8);
    console.log("referralCode: " + referralCode);
    const user = new User({
      username,
      firstName,
      lastName,
      email,
      password,
      referralCode,
    });

    if (referral) {
      console.log("Stuck Here");
      const refferer = await User.findOne({ referralCode: referral });

      if(refferer){
        console.log({ refferal: refferer, referralCode: referral });
  
        user.referralToken = refferer._id;
      }
    }

    let savedUser = await user.save();

    try {
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
    } catch (err) {
      console.log(err);
      req.flash("error", "User Registration Unsuccessfull");
      return res.redirect("/register");
    }
  },
  userLogin: async (req, res, next) => {
    console.log(req.user);
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      req.flash(
        "error",
        errors.array().map((err) => err.msg)
      );
      // return res.status(422).json({ errors: errors.array() });
      return res.redirect("/login");
    }

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
            req.flash("error", "Invalid Credentials");
            return res.redirect("/login");
          }
          req.logIn(user, (err) => {
            if (err) {
              console.log(err);
              return next(err);
            }
            req.flash("success", "User Successfully Logged In");
            return res.redirect("/");
          });
        })(req, res, next);
      }
    } else {
      req.flash("error", "Invalid Credentials");
      return res.redirect("/login");
    }
  },
  /**
   * User Verification
   */
  getVerifyOtp: async (req, res) => {
    const locals = {
      title: "SoleStride - Register",
    };

    // console.log(req.session);

    if (!req.session.verifyToken) {
      return res.redirect("/");
    }

    res.render("auth/user/verifyOtp", {
      locals,
    });
  },

  verifyOtp: async (req, res) => {
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
            const user = await User.findOne({ _id: req.session.verifyToken });

            console.log(`user ${user.referralToken}`);

            if (user.referralToken) {
              const referrer = await User.findOne({ _id: user.referralToken });

              if (referrer) {
                referrer.refferalRewards += 100;
                user.refferalRewards += 100;

                const referrerWallet = await Wallet.findOne({
                  userId: referrer._id,
                });
                const userWallet = await Wallet.findOne({ userId: user._id });

                if (!referrerWallet) {
                  const referrerWallet = new Wallet({
                    userId: referrer._id,
                    balance: 100,
                    transactions: [
                      {
                        date: Date.now(),
                        amount: 100,
                        message: "Refferal Reward",
                        type: "Credit",
                      },
                    ],
                  });
                  await referrerWallet.save();
                } else {
                  referrerWallet.balance += 100;
                  referrerWallet.transactions.push({
                    date: Date.now(),
                    amount: 100,
                    message: "Refferal Reward",
                    type: "Credit",
                  });
                  await referrerWallet.save();
                }

                if (!userWallet) {
                  const userWallet = new Wallet({
                    userId: user._id,
                    balance: 100,
                    transactions: [
                      {
                        date: Date.now(),
                        amount: 100,
                        message: "Refferal Reward",
                        type: "Credit",
                      },
                    ],
                  });
                  await userWallet.save();
                }

                referrer.successfullRefferals.push({
                  date: Date.now(),
                  username: user.username,
                  status: "Successful Refferal",
                });

                await referrer.save();
                await user.save();
              }
            }

            req.flash("success", "User verificaion successfull, Please Login");
            console.log("success");
            delete req.session.verifyToken;
            return res.redirect("/login");
          }
        } else {
          req.flash("error", "Please enter a valid OTP!!!!!!");
          console.log("errorr, otp not valid");
          return res.redirect("/verify-otp");
        }
      } else {
        req.flash("error", "OTP expired, Try again by logging in!!!!!!");
        console.log("errorr, otp expired");
        return res.redirect("/login");
      }
    } else if (req.session.forgotPassToken) {
      const userId = req.session.forgotPassToken;
      if (userId) {
        const otpData = await OTP.findOne({ userId });
        if (otpData && (await bcrypt.compare(otp, otpData.otp))) {
          req.flash("success", "Enter your new password");

          delete req.session.forgotPassToken;
          req.session.resetVerified = true;
          req.session.passwordResetToken = userId;
          return res.redirect("/reset-password");
        } else {
          req.flash("error", "Invalid OTP, Try again!!!!!!");
          console.log("error,  invalid otp");
          return res.redirect("/forgot-password");
        }
      } else {
        req.flash("error", "Session Timeout, Try again!!!!!!");
        console.log("error, otp verify faild");
        return res.redirect("/forgot-password");
      }
    } else {
      req.flash(
        "error",
        "Session Timeout, OTP verification failed, Try again by logging in!!!!!!"
      );
      console.log("error, otp verify faild");
      return res.redirect("/login");
    }
  },

  /**
   * Resend OTP
   */
  resendOTP: async (req, res) => {
    try {
      let userId = req.session.passwordResetToken
        ? req.session.passwordResetToken
        : req.session.verifyToken;

      if (req.session.forgotPassToken) {
        userId = req.session.forgotPassToken;
      }

      const user = await User.findOne({
        _id: userId,
        isAdmin: false,
        isBlocked: false,
      });
      const otpSend = sendOtpEmail(user, res);
      if (otpSend) {
        return res.status(201).json({ success: true });
      }

      return res.status(500).json({
        success: false,
        message: "Server facing some issues try again !",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: `${error}` });
    }
  },
  /**
   * Forgot Password
   */
  getForgotPass: async (req, res) => {
    const locals = {
      title: "SoleStride - Forgot Password",
    };
    res.render("auth/user/forgotPassword", {
      locals,
    });
  },
  forgotPass: async (req, res) => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      req.flash(
        "error",
        errors.array().map((err) => err.msg)
      );
      // return res.status(422).json({ errors: errors.array() });
      return res.redirect("/forgot-password");
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    const userId = user._id;
    if (user) {
      const otpSend = sendOtpEmail(user, res);

      req.session.forgotPass = true;
      if (otpSend) {
        req.flash("success", "OTP send to mail");
        req.session.forgotPass = true;
        req.session.forgotPassToken = userId;
        return res.redirect("/forgot-password/verify-otp");
      }
      req.flash("error", "Failed to send otp try again!!!!");
      return res.redirect("/forgot-password");
    }
  },
  getForgotPassOtp: async (req, res) => {
    const locals = {
      title: "SoleStride - Register",
    };

    console.log(req.session);

    if (!req.session.forgotPass) {
      return res.redirect("/");
    }

    res.render("auth/user/verifyOtp", {
      locals,
    });
  },

  getResetPass: async (req, res) => {
    if (req.user || !req.session.resetVerified) {
      return res.redirect("/");
    }

    res.render("auth/user/resetPass", {
      error: req.flash("error"),
      success: req.flash("success"),
    });
  },
  resetPass: async (req, res) => {
    // console.log(req.body);
    const errors = validationResult(req);
    // console.log(errors);
    if (!errors.isEmpty()) {
      req.flash(
        "error",
        errors.array().map((err) => err.msg)
      );
      return res.redirect("/reset-password");
    }

    if (req.session.resetVerified && req.session.passwordResetToken) {
      const userId = req.session.passwordResetToken;
      const { password, confirmPassword } = req.body;

      if (password !== confirmPassword) {
        req.flash("error", "Passwords do not match, Try again");
        return res.redirect("/reset-password");
      }

      

      const user = await User.findById(userId);

      const isSamePassword = await bcrypt.compare(
        password,
        user.password
      );

      if (isSamePassword) {
        req.flash("error", "New password cannot be same as old password");
        return res.redirect("/reset-password");
      }

      const hashPwd = await bcrypt.hash(password, 10);
      if (user) {
        const updatedUser = await User.updateOne(
          { _id: user._id },
          {
            $set: {
              password: hashPwd,
            },
          }
        );

        if (updatedUser) {
          console.log("User password reseted");

          delete req.session.resetVerified;
          delete req.session.passwordResetToken;

          req.flash(
            "success",
            "Password reset successfully, Please login with the new password"
          );
          return res.redirect("/login");
        }
      } else {
        console.log("Failed to reset password try again");

        delete req.session.resetVerified;
        delete req.session.passwordResetToken;

        req.flash("error", "Failed to reset password try again");
        return res.redirect("/forgot-password");
      }
    } else {
      console.log("Session timed out try again");

      req.flash("error", "Session timed out try again");
      return res.redirect("/forgot-password");
    }
  },

  /**
   * User Logout
   */
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
  adminLogout: async (req, res) => {
    req.logOut((err) => {
      if (err) {
        console.log(err);
      } else {
        req.flash("success", `Logged Out!!`);
        res.clearCookie("connect.sid");
        res.redirect("/admin/login");
      }
    });
  },
};
