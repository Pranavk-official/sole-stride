const User = require("../model/userSchema");
const Address = require("../model/addressSchema");
const Order = require("../model/orderSchema");
const bcrypt = require("bcrypt");

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
  getOrders: async (req, res) => {
    const locals = {
      title: "SoloStride - Profile",
    };
    res.render("user/orders", {
      locals,
      user: req.user,
    });
  },
  getOrder: async (req, res) => {
    const locals = {
      title: "SoloStride - Profile",
    };
    res.render("user/orderDetail", {
      locals,
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

  // ORDERS

  placeOrder: async (req, res) => {
    console.log(req.body);
    let customer_id = req.user.id;
    let status;
    if (
      req.body.paymentMethod === "COD" ||
      req.body.paymentMethod === "wallet"
    ) {
      status = "confirmed";
    } else {
      status = "pending";
    }

    let cartList = await User.aggregate([
      { $match: { _id: customer_id } },
      { $project: { cart: 1, _id: 0 } },
      { $unwind: { path: "$cart" } },
      {
        $lookup: {
          from: "products",
          localField: "cart.product_id",
          foreignField: "_id",
          as: "prod_detail",
        },
      },
      { $unwind: { path: "$prod_detail" } },
      {
        $project: {
          prod_detail_id: 1,
          "prod_detail.selling_price": 1,
          cart: 1,
        },
      },
    ]);
    const address = await Address.findOne({ _id: req.body.address });

    let items = []

    for (let i = 0; i < cartList.length; i++) {
      items.push({
        product_id: cartList[i].cart.product_id,
        quantity: cartList[i].cart.quantity,
        price: parseInt(cartList[i].prod_detail.selling_price),
        status: status,
      });
    }

    let totalPrice = 0;
    for (let prod of cartList) {
      prod.price = prod.prod_details.sellingPrice * prod.cart.quantity;
      totalPrice += prod.price; // Calculate total price
    }

    let order = {
      customer_id: customer_id,
      items: items,
      address: address,
      payment_method: req.body.paymentMethod,
      total_amount: totalPrice,
      status: status,
    };

    if (req.body.paymentMethod === 'COD') {
      const createOrder = await Order.create(order);
      if (createOrder) {

          //empty the cart
          await User.updateOne({ _id: customer_id }, { $unset: { cart: '' } })

          //reduce the stock count 
          for (let i = 0; i < items.length; i++) {
              await Product.updateOne({ _id: items[i].product_id }, { $inc: { stock: -(items[i].quantity) } })
          }
          req.session.order = {
              status: true
          }
          res.json({
              success: true
          });
      }
  }
  },
};
