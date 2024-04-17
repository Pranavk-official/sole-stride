const Coupon = require("../model/couponSchema");
const Cart = require("../model/cartSchema");
const layout = "./layouts/adminLayout";

module.exports = {
  getCoupons: async (req, res) => {
    let perPage = 9;
    let page = req.query.page || 1;

    const coupons = await Coupon.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    const count = await Coupon.find().countDocuments();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render("admin/coupons/coupons.ejs", {
      coupons,
      layout,
      current: page,
      pages: Math.ceil(count / perPage),
      nextPage: hasNextPage ? nextPage : null,
      currentRoute: "/admin/coupons/",
    });
  },
  getCoupon: async (req, res) => {
    let id = req.params.id;
    try {
      const coupon = await Coupon.findById(id);
      if (coupon) {
        res.status(200).json(coupon);
      } else {
        res.status(404).json({ error: "Coupon not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch coupon" });
    }
  },
  addCoupon: async (req, res) => {
    console.log(req.body);
    try {
      let {
        code,
        description,
        rateOfDiscount,
        minPurchaseAmount,
        maximumDiscount,
        expirationDate,
      } = req.body;

      minPurchaseAmount = Number(minPurchaseAmount);
      rateOfDiscount = Number(rateOfDiscount);
      maximumDiscount = Number(maximumDiscount);
      expirationDate = new Date(expirationDate);
      code = code.trim().toLowerCase();

      // Check if the coupon code already exists
      const couponExists = await Coupon.exists({ code });
      if (couponExists) {
        return res.status(400).json({
          success: false,
          message:
            "A coupon with this code already exists. Please use a different code.",
        });
      }

      let coupon = new Coupon({
        code,
        description,
        minPurchaseAmount,
        rateOfDiscount,
        maximumDiscount,
        isActive: true,
        expirationDate,
      });

      let savedData = await coupon.save();
      console.log(savedData);
      if (savedData instanceof Coupon) {
        return res
          .status(201)
          .json({ success: true, message: "New coupon created!" });
      }

      throw new Error("Failed to add new coupon due to server issues.");
    } catch (error) {
      console.log(error);
      // Check if the error is a Mongoose validation error
      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: error.message, // This will contain the specific validation error messages
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to add new coupon due to server issues.",
      });
    }
  },
  editCoupon: async (req, res) => {
    try {
      console.log(req.body);
      const id = req.params.id;
      let {
        code,
        description,
        minPurchaseAmount,
        rateOfDiscount,
        maximumDiscount,
        expirationDate,
        isActive,
      } = req.body;

      minPurchaseAmount = Number(minPurchaseAmount);
      rateOfDiscount = Number(rateOfDiscount);
      maximumDiscount = Number(maximumDiscount);
      expirationDate = new Date(expirationDate);
      code = code.trim().toLowerCase();

      isActive = isActive === "true" ? true : false;

      // Validate the input fields
      if (
        !code ||
        !description ||
        !minPurchaseAmount ||
        !description ||
        !rateOfDiscount ||
        !maximumDiscount ||
        !expirationDate ||
        !isActive
      ) {
        return res.status(400).json({
          success: false,
          message:
            "All fields are mandatory. Rate of discount and maximum discount should be above zero. Try Again!",
        });
      } else if (
        isNaN(rateOfDiscount) ||
        isNaN(minPurchaseAmount) ||
        isNaN(maximumDiscount) ||
        rateOfDiscount < 0 ||
        maximumDiscount < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Rate of discount and maximum discount value should be non-negative numerical values. Try Again!",
        });
      }

      // Update the coupon document
      const update = {
        code,
        description,
        minPurchaseAmount,
        rateOfDiscount,
        maximumDiscount,
        isActive,
        expirationDate,
      };

      const opts = { runValidators: true, new: true }; // runValidators ensures schema validation is applied

      console.log(req.params);
      const updatedCoupon = await Coupon.findOneAndUpdate(
        { _id: req.params.id },
        update,
        opts
      );

      console.log(updatedCoupon);
      if (updatedCoupon) {
        req.flash("success", "Coupon updated successfully!");
        return res.redirect("/admin/coupons");
        // return res.status(200).json({
        //     success: true,
        //     message: "Coupon updated successfully!",
        //     coupon: updatedCoupon,
        // });
      } else {
        req.flash("error", "Coupon not found!");
        return res
          .status(404)
          .json({ success: false, message: "Coupon not found!" });
      }
    } catch (error) {
      console.log(error);
      // Handle validation errors
      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: error.message, // This will contain the specific validation error messages
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to update coupon due to server issues.",
      });
    }
  },
  toggleStatus: async (req, res) => {
    let id = req.params.id;
    try {
      const coupon = await Coupon.findById(id);
      console.log(coupon);
      if (coupon) {
        coupon.isActive = !coupon.isActive; // Toggle the listing status
        await coupon.save();
        let status = coupon.isActive ? "Activated" : "Dectivated";
        res.status(200).json({
          coupon: coupon,
          message: `The Coupon : ${coupon.code.toUpperCase()} is ${status}`,
        });
      } else {
        res.status(404).json({ error: "Size not found" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to toggle listing status" });
    }
  },
  //   Do i need this
  deleteCoupon: async (req, res) => {},

  /***
   * User Side
   *  - apply
   *  - remove
   *  - get all coupons
   */

  applyCoupon: async (req, res) => {
    try {
      let { code } = req.body;
      console.log(req.body);
      code = code.trim().toLowerCase();

      const couponCode = await Coupon.findOne({ code: code });

      if (!couponCode) {
        return res
          .status(404)
          .json({ success: false, message: "Coupon not found." });
      }

      // // Check if the coupon is used by the user
      // const userHasUsedCoupon = couponCode.usedBy.some((user) =>
      //   user.userId.equals(req.user.id)
      // );

      // if (userHasUsedCoupon) {
      //   return res
      //     .status(400)
      //     .json({
      //       success: false,
      //       message: "Coupon has already been used by this user.",
      //     });
      // }

      const currentDate = new Date();
      const expirationDate = new Date(couponCode.expirationDate);

      if (currentDate > expirationDate || !couponCode.isActive) {
        return res
          .status(400)
          .json({ success: false, message: "Coupon is expired or inactive." });
      }

      const userCart = await Cart.findOne({ userId: req.user.id });
      if (!userCart) {
        return res
          .status(404)
          .json({ success: false, message: "User cart not found." });
      }

      // Check if the cart total is greater than the minimum purchase amount
      const totalPrice = userCart.totalPrice || 0;
      if (totalPrice < couponCode.minPurchaseAmount) {
        return res.status(400).json({
          success: false,
          message:
            "Cart total is less than the minimum purchase amount for this coupon.",
        });
      }

      // Check if the coupon is already applied
      if (
        userCart.coupon &&
        userCart.coupon.toString() === couponCode._id.toString()
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Coupon is already in use." });
      }

      // Calculate the discount amount based on the coupon's rateOfDiscount
      let discountAmount = totalPrice * (couponCode.rateOfDiscount / 100);

      // Check if the discount amount is greater than the maximum discount
      if (discountAmount > couponCode.maximumDiscount) {
        discountAmount = couponCode.maximumDiscount;
      }

      userCart.couponDiscount = discountAmount;
      userCart.coupon = couponCode._id;
      await userCart.save();

      return res.status(200).json({
        success: true,
        message: "Coupon is valid and applied!",
        coupon: couponCode,
        discountAmount,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "An error occurred." });
    }
  },
  removeCoupon: async (req, res) => {
    try {
      // Check if the cart exists and the user is associated with it
      const cart = await Cart.findOne({ userId: req.user.id });

      console.log(cart);
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      // Set coupon to undefined
      cart.coupon = undefined;
      cart.couponDiscount = 0; // Reset the coupon discount to 0

      await cart.save();
      return res.status(200).json({ message: "Coupon removed successfully" });
    } catch (error) {
      console.error("Error removing coupon:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getAllCoupons: async (req, res) => {},
};
