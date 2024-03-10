const mongoose = require("mongoose");
const Product = require("../model/productSchema");
const Order = require("../model/orderSchema");
// const Cart = require("../model/cartSchema");
const User = require("../model/userSchema");

const addProductToCart = async (userId, productId, variantId, color, size) => {
  const user = await User.findOne({ _id: userId });

  const pipeline = [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(productId),
      },
    },
    {
      $project: {
        variants: {
          $filter: {
            input: "$variants",
            as: "variant",
            cond: {
              $eq: ["$$variant._id", new mongoose.Types.ObjectId(variantId)],
            },
          },
        },
      },
    },
    {
      $unwind: "$variants",
    },
    {
      $project: {
        stock: "$variants.stock",
      },
    },
  ];

  const result = await Product.aggregate(pipeline);

  const stock = result[0].stock;

  const currentQuantity = user.cart.find(
    (item) => item.product_id == productId && item.variant == variantId
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
          "cart.variant": variantId,
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
          variant: variantId,
          color,
          size,
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

// Helper function to handle common logic
const handleCartUpdate = async (req, res, increment = true) => {
  try {
    const userID = req.user.id;
    const { id: productId, variant: variantId } = req.params;
    let user = await User.findOne({ _id: userID });
    const productVariant = await Product.findOne(
      { "variants._id": variantId },
      { "variants.$": 1, _id: 0 }
    );
    const variantStock = productVariant.variants[0].stock;
    const currentQuantity = user.cart.find(
      (item) =>
        item.product_id.toString() === productId &&
        item.variant.toString() === variantId
    );

    if (increment && currentQuantity.quantity >= variantStock) {
      return res.status(400).json({
        success: false,
        message: "Quantity Exceeds Product Stock",
      });
    } else if (!increment && currentQuantity.quantity <= 1) {
      return res.status(400).json({
        success: false,
        message: "Cannot decrease quantity below 1",
      });
    }

    const updated = await User.updateOne(
      {
        _id: userID,
        "cart.product_id": productId,
        "cart.variant": variantId,
      },
      {
        $inc: {
          "cart.$.quantity": increment ? 1 : -1,
        },
      },
      { new: true }
    );

    if (updated) {
      let userCart = await User.findById(userID).populate(
        "cart.product_id cart.color cart.size"
      );
      let totalPrice = 0;
      for (let prod of userCart.cart) {
        prod.price = prod.product_id.sellingPrice * prod.quantity;
        totalPrice += prod.price;
      }
      const currentItem = userCart.cart.find(
        (item) =>
          item.product_id._id.toString() === productId &&
          item.variant.toString() === variantId
      );

      console.log(totalPrice);
      return res.status(200).json({
        success: true,
        cart: currentItem,
        totalPrice,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Failed to update cart item",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getCart: async (req, res) => {
    let errors = [];
    if (!req.isAuthenticated()) {
      req.flash("error", "Please log in to view cart.");
      return res.redirect("/login");
    } else {
      let user = await User.findById(req.user.id);

      // console.log(user.cart[0]);
      let userCart = await User.findById(req.user.id).populate(
        "cart.product_id cart.color cart.size"
      );

      let cartList = await User.aggregate([
        { $match: { _id: user._id } },
        { $project: { cart: 1, _id: 0 } },
        { $unwind: "$cart" },
        {
          $lookup: {
            from: "products",
            localField: "cart.product_id",
            foreignField: "_id",
            as: "prod_details",
          },
        },
        { $unwind: "$prod_details" },
        // Additional $lookup stages for color and size if they are separate collections
        // {
        //   $lookup: {
        //     from: "colors",
        //     localField: "prod_details.variants.color",
        //     foreignField: "_id",
        //     as: "color_details",
        //   },
        // },
        // { $unwind: "$color_details" },
        // {
        //   $lookup: {
        //     from: "sizes",
        //     localField: "prod_details.variants.size",
        //     foreignField: "_id",
        //     as: "size_details",
        //   },
        // },
        // { $unwind: "$size_details" },
      ]);

      let totalPrice = 0;
      for (let prod of cartList) {
        prod.price = prod.prod_details.sellingPrice * prod.cart.quantity;
        totalPrice += prod.price; // Calculate total price
      }
      let total = 0;
      for (let prod of userCart.cart) {
        prod.price = prod.product_id.sellingPrice * prod.quantity;
        total += prod.price;
      }

      for (const item of user.cart) {
        try {
          const product = await Product.findOne({
            _id: item.product_id,
          }).populate("variants.color variants.size");
          if (product) {
            let notFound = false;
            if (!product.isActive) {
              notFound = true;
              errors.push(
                `The Product ${product.product_name} is not available!!`
              );
            }
            const variant = product.variants.find(
              (v) => v._id.toString() === item.variant.toString()
            );
            if (variant) {
              const stock = variant.stock;
              console.log(`Variant: ${variant._id}, Stock: ${stock}`);
              if (item.quantity > stock) {
                item.outOfStock = true;
              }
              if (item.outOfStock & !notFound) {
                errors.push(
                  `The Product ${product.product_name}, Color: ${variant.color.name}, Size: ${variant.size.value} is out of stock!!`
                );
              }
            } else {
              errors.push(
                `The Variant of Product ${product.product_name} is not found!!`
              );
              console.log(
                `Variant with ID ${item.variant} not found for product ${item.product}`
              );
            }
          } else {
            errors.push(`The Product ${product.product_name} is not found!!`);
            console.log(`Product with ID ${item.product} not found`);
          }
        } catch (error) {
          console.error(`Error finding stock for item: ${error.message}`);
        }
      }
      // console.log(cartList);
      let cartCount = req.user.cart.length; // Update cartCount

      res.render("shop/cart", {
        cartList: userCart.cart,
        cartCount,
        totalPrice,
        errorMsg: errors,
      });
    }
  },
  addToCart: async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        status: false,
        message: "You need to login to add items to the cart!",
      });
    }

    let userId = req.user.id;
    let { productId, variantId, color, size } = req.body;

    try {
      const product = await Product.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ status: false, message: "Product not found" });
      }

      const variant = product.variants.find(
        (v) => v._id.toString() === variantId
      );
      if (!variant) {
        return res
          .status(404)
          .json({ status: false, message: "Variant not found" });
      }
      console.log(variant);
      // TODO: quantity
      const stock = variant.stock;
      if (stock === 0) {
        return res
          .status(409)
          .json({ status: false, message: "Product Out Of Stock" });
      }

      // Check if the product already exists in the cart
      const user = await User.findById(userId).select("cart");
      const productInCart = user.cart.find(
        (item) =>
          item.product_id.toString() === productId &&
          item.variant.toString() === variantId
      );

      if (productInCart) {
        return res
          .status(400)
          .json({ status: false, message: "Product already in cart" });
      }

      let updatedUser = await addProductToCart(
        userId,
        productId,
        variantId,
        color,
        size
      );
      if (updatedUser) {
        let cartCount = updatedUser.cart.length;
        return res.json({
          status: true,
          count: cartCount,
        });
      } else {
        return res
          .status(400)
          .json({ status: false, message: "Quantity Exceeds Product Stock" });
      }
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ status: false, message: "An error occurred" });
    }
  },

  removeCartItem: async (req, res) => {
    let id = req.params.id;
    let variant = req.params.variant;
    let userId = req.user.id;
    await User.updateOne(
      { _id: userId },
      { $pull: { cart: { product_id: id, variant: variant } } }
    );
    res.json({
      status: true,
    });
  },

  // Use the helper function in both incrementCartItem and decrementCartItem
  incrementCartItem: async (req, res) => {
    await handleCartUpdate(req, res, true);
  },

  decrementCartItem: async (req, res) => {
    await handleCartUpdate(req, res, false);
  },

  getOrderSuccess: async (req, res) => {
    let user = await User.findById(req.user.id);
    let order = await Order.aggregate([
      {
        $match: {
          customer_id: user._id,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $limit: 1,
      },
    ]);
    let order_id = order[0]._id;

    res.render("shop/orderConfirm", {
      order: order_id,
    });
  },
};
