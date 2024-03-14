const User = require("../model/userSchema");
const Address = require("../model/addressSchema");
const Product = require("../model/productSchema");
const WishList = require("../model/wishlistSchema");
const Order = require("../model/orderSchema");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

module.exports = {
  /**
   * User Profile Mangement
   */
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
    const user = await User.findById(req.user.id)

    const {firstName, lastName, phone} = req.body

    user.firstName = firstName
    user.lastName = lastName
    user.phone = phone

    await user.save()
  },


  getAddress: async (req, res) => {
    const address = await Address.find({
      customer_id: req.user.id,
      delete: false,
    });

    // console.log(address);

    const locals = {
      title: "SoloStride - Profile",
    };

    res.render("user/address", {
      locals,
      address,
      user: req.user,
    });
  },

  /***
   * User Wishlist Mangement
   */

  getWishlist: async (req, res) => {
    const locals = {
      title: "SoloStride - Wishlist",
    };
    let user = await User.findById(req.user.id);
    let wishlist = await WishList.findById(user.wishlist).populate({
      path: "products",
      populate: { path: "brand" },
    });
    // console.log(wishlist);

    res.render("user/wishlist", {
      locals,
      wishlist,
      products: wishlist.products,
    });
  },

  addToWishlist: async (req, res) => {
    console.log(req.body);
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: "Please log in to add product to wishlist",
      });
    }

    const { productId } = req.body;
    let product,
      user,
      userWishListID,
      userWishListData,
      productsInWishList,
      productAlreadyInWishList;

    try {
      product = await Product.findById(productId);
      user = await User.findById(req.user.id);

      if (!product) {
        console.log("Product not found");
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      if (!user) {
        console.log("User not found");
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      userWishListID = user.wishlist;

      if (!userWishListID) {
        const newWishList = new WishList({ userId: user._id });
        await newWishList.save();
        userWishListID = newWishList._id;
        await User.findByIdAndUpdate(user._id, {
          $set: { wishlist: userWishListID },
        });
      }

      userWishListData = await WishList.findById(userWishListID);
      productsInWishList = userWishListData.products;

      productAlreadyInWishList = productsInWishList.some((existingProduct) =>
        existingProduct.equals(product._id)
      );

      if (productAlreadyInWishList) {
        console.log("Product already exists in wishlist");
        return res.status(400).json({
          success: false,
          message: "Product already exists in wishlist",
        });
      }

      await WishList.findByIdAndUpdate(userWishListID, {
        $push: { products: product._id },
      });

      console.log("Product added to wishlist");
      return res
        .status(201)
        .json({ success: true, message: "Product added to wishlist" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "An error occurred, server facing issues !",
      });
    }
  },
  removeFromWishlist: async (req, res) => {
    try {
      const { productId } = req.body;
      const user = await User.findById(req.user.id);

      const updatedWishList = await WishList.findByIdAndUpdate(user.wishlist, {
        $pull: { products: productId },
      });

      if (updatedWishList) {
        return res.status(201).json({
          success: true,
          message: "Removed item from wishlist",
        });
      } else {
        return res.status(500).json({
          success: true,
          message: "failed to remove product from wishlist try again",
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: true,
        message: "failed to remove product from wishlist try again",
      });
    }
  },

  // Password Reset From Profile
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

  /**
   * User Address Management
   */

  addAddress: async (req, res) => {
    console.log(req.body);
    await Address.create(req.body);
    req.flash("success", "Address Addedd");
    res.redirect("/user/address");
  },
  getEditAddress: async (req, res) => {
    const addressId = req.params.id;

    try {
      const address = await Address.findOne({ _id: addressId });
      if (address) {
        res.status(200).json({ status: true, address });
      } else {
        // Send a  404 status code with a JSON object indicating the address was not found
        res.status(404).json({ status: false, message: "Address not found" });
      }
    } catch (error) {
      // Handle any errors that occurred during the database operation
      console.error(error);
      res.status(500).json({ status: false, message: "Internal server error" });
    }
  },
  editAddress: async (req, res) => {
    try {
      const addressId = req.params.id;
      const updatedAddress = req.body;

      // Assuming you have a model for addresses, e.g., Address
      const address = await Address.findByIdAndUpdate(
        addressId,
        updatedAddress,
        {
          new: true, // returns the new document if true
        }
      );

      if (!address) {
        return res
          .status(404)
          .send({ message: "Address not found with id " + addressId });
      }

      req.flash("success", "Address Edited");
      res.redirect("/user/address");
    } catch (error) {
      console.error(error);
      req.flash("error", "Error editing address. Please try again.");
      res.redirect("/user/address");
    }
  },

  deleteAddress: async (req, res) => {
    let id = req.params.id;
    try {
      // Check if the address is in use by any orders
      const order = await Order.findOne({ "address._id": id });
      if (order) {
        console.log(order);
        // If the address is in use, perform a soft delete by setting the delete boolean to true
        const result = await Address.findByIdAndUpdate(
          id,
          { delete: true },
          { new: true }
        );
        if (result) {
          console.log(result);
          res
            .status(200)
            .json({ message: "Address marked as deleted successfully" });
        } else {
          res.status(404).json({ message: "Address not found" });
        }
      } else {
        // If the address is not in use, proceed with the deletion
        const result = await Address.deleteOne({ _id: id });
        if (result.deletedCount === 1) {
          res.status(200).json({ message: "Address deleted successfully" });
        } else {
          res.status(404).json({ message: "Address not found" });
        }
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
