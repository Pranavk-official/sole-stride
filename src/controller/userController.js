const User = require("../model/userSchema");
const Address = require("../model/addressSchema");
const Product = require("../model/productSchema");
const Order = require("../model/orderSchema");
const bcrypt = require("bcrypt");
const mongoose = require('mongoose')

module.exports = {
  getProfile: async (req, res) => {
    const locals = {
      title: "SoloStride - Profile",
    };

    res.render("user/profile", {
      locals,
      user: req.user,
    });
  },
  editProfile: async (req, res) => {
    console.log(req.body);
  },

  getAddress: async (req, res) => {
    const address = await Address.find({
      customer_id: req.user.id,
      delete: false,
    });

    console.log(address);

    const locals = {
      title: "SoloStride - Profile",
    };

    res.render("user/address", {
      locals,
      address,
      user: req.user,
    });
  },
  getWishlist: async (req, res) => {
    const locals = {
      title: "SoloStride - Wishlist",
    };
    res.render("user/wishlist", {
      locals,
      user: req.user,
    });
  },
  resetPass: async (req, res) => {
    try {
      // console.log(req.body);
      const { oldPassword, newPassword, confirmNewPassword } = req.body;

      const user = await User.findById(req.user.id);
      if (user) {
        bcrypt.compare(
          oldPassword,
          user.password,
          async (err, validOldPass) => {
            if (validOldPass) {
              if (newPassword !== confirmNewPassword) {
                req.flash("error", "Passwords Do not Match");
                return res.redirect("/user/profile");
              } else {
                user.password = newPassword; // Assuming you have a method to hash the password
                await user.save();
                // return res.status(200).json({ 'success': 'Password Updated' });
                req.flash("success", "Password Updated");
                return res.redirect("/user/profile");
              }
            } else {
              // return res.status(401).json({ 'error': 'Old password is incorrect' });
              req.flash("error", "Old Password is incorrect");
              return res.redirect("/user/profile");
            }
          }
        );
      } else {
        // return res.status(404).json({ 'error': 'User not found' });
        req.flash("error", "User not found");
        return res.redirect("/user/profile");
      }
    } catch (error) {
      // return res.status(500).json({ 'error': 'Internal server error' });
      req.flash("error", "Internal server error");
      return res.redirect("/user/profile");
    }
  },

  addAddress: async (req, res) => {
    console.log(req.body);
    await Address.create(req.body);
    req.flash("success", "Address Addedd");
    res.redirect("/user/address");
  },

  // ADDRESS
  deleteAddress: async (req, res) => {
    let id = req.params.id;
    const address = await Address.findOneAndUpdate(
      { _id: id },
      { delete: true },
      { new: true }
    );
    if (address) {
      req.flash("success", "Address Deleted");
      return res.redirect("/user/address");
    }
  },
  
};
