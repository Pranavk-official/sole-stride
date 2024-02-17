const Product = require("../model/productSchema");
// const Cart = require("../model/cartSchema");
const User = require("../model/userSchema");

const addProductToCart = async (userId, productId) => {
  const user = await User.findOne({ _id: userId });
  const stock = await Product.findOne({ _id: productId }, { stock: 1, _id: 0 });
  const currentQuantity = user.cart.find(
    (item) => item.product_id == productId
  );

  if (currentQuantity) {
    // Product exists in the cart, increment quantity
    let currentStock = stock.stock;
    let quantity = currentQuantity.quantity;

    if (quantity >= currentStock) {
      // Quantity exceeds stock, return false
      return false;
    } else {
      // Increment quantity and update the cart
      const updated = await User.findOneAndUpdate(
        {
          _id: userId,
          "cart.product_id": productId,
        },
        {
          $inc: {
            "cart.$.quantity": 1,
          },
        }
      );
      return updated;
    }
  } else {
    const cart = {
      $push: {
        cart: {
          product_id: productId,
          quantity: 1,
        },
      },
    };
    const updatedCart = await User.findByIdAndUpdate({ _id: userId }, cart, {
      new: true,
    });
    return updatedCart;
  }
};

module.exports = {
  getCart: async (req, res) => {
    let userData = req.user;

    let user = await User.findById(req.user.id);
    // console.log(user.cart);

    let cartList = await User.aggregate([
      { $match: { _id: user._id } },
      { $project: { cart: 1, _id: 0 } },
      { $unwind: { path: "$cart" } },
      {
        $lookup: {
          from: "products",
          localField: "cart.product_id",
          foreignField: "_id",
          as: "prod_details",
        },
      },
      { $unwind: { path: "$prod_details" } },
    ]);

    let totalPrice = 0;
    for (let prod of cartList) {
      prod.price = prod.prod_details.sellingPrice * prod.cart.quantity;
      totalPrice += prod.price; // Calculate total price
    }

    let cartCount = req.user.cart.length; // Update cartCount

    // console.log(cartList, cartCount, totalPrice);

    res.render("shop/cart", {
      cartList,
      cartCount,
      totalPrice,
    });
  },
  addToCart: async (req, res) => {
    if (!req.isAuthenticated()) {
      return res
        .json({ status: false, message: "Please Log In to use the cart" })
        .status(401);
    }

    let productId = req.params.id;
    let userID = req.user.id;
    let updatedUser = await addProductToCart(userID, productId);
    if (updatedUser) {
      let cartCount = updatedUser.cart.length;
      res.json({
        status: true,
        count: cartCount,
      });
    } else {
      res.json({
        status: false,
        message: 'Quantity Exceeds Product Stock'
      });
    }
  },
  removeCartItem: async (req, res) => {
    let id = req.params.id;
    let userId = req.user.id;
    await User.updateOne(
      { _id: userId },
      { $pull: { cart: { product_id: id } } }
    );
    res.json({
      status: true,
    });
  },

  incrementCartItem: async (req, res) => {
    let userID = req.user.id;
    const productId = req.params.id;
    let user = await User.findOne({ _id: userID });
    const stock = await Product.findOne(
      { _id: productId },
      { stock: 1, _id: 0 }
    );
    const currentQuantity = user.cart.find(
      (item) => item.product_id == productId
    );
    let currentStock = stock.stock;
    let quantity = currentQuantity.quantity;

    if (quantity > currentStock - 1) {
      res.json({
        success: false,
        message: 'Quantity Exceeds Product Stock'
      });
    } else {
      const updated = await User.updateOne(
        {
          _id: userID,
          "cart.product_id": productId,
        },
        {
          $inc: {
            "cart.$.quantity": 1,
          },
        }
      );
      if (updated) {
        res.json({
          success: true,
        });
      }
    }
  },
  decrementCartItem: async (req, res) => {
    let userID = req.user.id;
    const productId = req.params.id;

    const updated = await User.updateOne(
      {
        _id: userID,
        "cart.product_id": productId,
      },
      {
        $inc: {
          "cart.$.quantity": -1,
        },
      }
    );
    if (updated) {
      res.json({
        success: true,
      });
    }
  },
};
