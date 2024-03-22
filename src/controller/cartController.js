const mongoose = require("mongoose");
const Product = require("../model/productSchema");
const Order = require("../model/orderSchema");
const Cart = require("../model/cartSchema");
const User = require("../model/userSchema");

const handleCartUpdate = async (req, res, increment = true) => {
  try {
    const userID = req.user.id;
    const { id: productId, variant: variantId } = req.params;
    const cart = await Cart.findOne({ userId: userID });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product_id.toString() === productId &&
        item.variant.toString() === variantId
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    const item = cart.items[itemIndex];
    const product = await Product.findById(productId).populate("variants");
    const variant = product.variants.find(
      (v) => v._id.toString() === variantId
    );
    const stock = variant.stock;

    if (increment && item.quantity >= stock) {
      return res
        .status(400)
        .json({ success: false, message: "Quantity exceeds product stock" });
    } else if (!increment && item.quantity <= 1) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot decrease quantity below 1" });
    }

    const updated = await Cart.updateOne(
      {
        userId: req.user.id,
        "items.product_id": productId,
        "items.variant": variantId,
      },
      {
        $inc: {
          "items.$.quantity": increment ? 1 : -1,
        },
      },
      { new: true }
    );

    if (updated) {
      let userCart = await Cart.findOne({ userId: req.user.id }).populate(
        "items.product_id"
      );
      // let totalPrice = 0;
      // for (let prod of userCart.items) {
      //   prod.price = prod.product_id.onOffer
      //     ? Math.ceil(prod.product_id.sellingPrice - Math.ceil(prod.product_id.sellingPrice * prod.product_id.offerDiscountRate) / 100)
      //     : prod.product_id.sellingPrice;
      //   prod.itemTotal = prod.price * prod.quantity;
      //   console.log(prod.price, prod.itemTotal);
      //   totalPrice += prod.itemTotal;
      // }

      let totalPrice = 0;
      let totalPriceBeforeOffer = 0;
      for (const prod of userCart.items) {
        prod.price = prod.product_id.onOffer
          ? prod.product_id.offerDiscountPrice
          : prod.product_id.sellingPrice;

        const itemTotal = prod.price * prod.quantity;
        prod.itemTotal = itemTotal;
        totalPrice += itemTotal;
        totalPriceBeforeOffer += prod.price;
      }

      userCart.totalPrice = totalPrice;
      await userCart.save();
      console.log(userCart);
      const currentItem = userCart.items.find(
        (item) =>
          item.product_id._id.toString() === productId &&
          item.variant.toString() === variantId
      );

      console.log(totalPrice);

      return res
        .status(200)
        .json({ success: true, cart: currentItem, totalPrice });
    } else {
      return res.status(400).json({
        success: false,
        message: "Failed to update cart item",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getCart: async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Please log in to view cart." });
    }

    try {
      const userId = req.user.id;
      const cart = await Cart.findOne({ userId }).populate(
        "items.product_id items.color items.size"
      );

      console.log(cart);

      if (!cart) {
        return res
          .status(404)
          .json({ success: false, message: "Cart not found" });
      }

      let totalPrice = 0;
      let totalPriceBeforeOffer = 0;
      for (const prod of cart.items) {
        prod.price = prod.product_id.onOffer
          ? prod.product_id.offerDiscountPrice
          : prod.product_id.sellingPrice;

        const itemTotal = prod.price * prod.quantity;
        prod.itemTotal = itemTotal;
        totalPrice += itemTotal;
        totalPriceBeforeOffer += prod.price;
      }

      cart.totalPrice = totalPrice;
      cart.payable = totalPrice;

      // if category offer is active or product offer is active

      let errors = [];
      for (const item of cart.items) {
        const product = await Product.findOne({
          _id: item.product_id,
        }).populate("variants.color variants.size");

        if (!product) {
          console.log(`The Product ${item.product_id} is not found!!`);
          errors.push(`The Product ${item.product_id} is not found!!`);
          continue;
        }

        if (!product.isActive) {
          console.log(`The Product ${product.product_name} is not available!!`);
          errors.push(`The Product ${product.product_name} is not available!!`);
          continue;
        }

        const variant = product.variants.find(
          (v) => v._id.toString() === item.variant.toString()
        );

        if (!variant) {
          console.log(
            `The Variant of Product ${product.product_name} is not found!!`
          );
          errors.push(
            `The Variant of Product ${product.product_name} is not found!!`
          );
          continue;
        }

        const stock = variant.stock;
        if (item.quantity > stock) {
          item.outOfStock = true;
          console.log(
            `The Product ${product.product_name}, Color: ${variant.color.name}, Size: ${variant.size.value} is out of stock!!`
          );
          errors.push(
            `The Product ${product.product_name}, Color: ${variant.color.name}, Size: ${variant.size.value} is out of stock!!`
          );
        }
      }
      await cart.save();
      // Assuming totalPrice is needed for the response
      res.render("shop/cart", {
        cartList: cart.items,
        cartCount: cart.items.length,
        totalPrice,
        errorMsg: errors,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching the cart." });
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
      const product = await Product.findById(productId).populate("variants");
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

      const stock = variant.stock;
      if (stock === 0) {
        return res
          .status(409)
          .json({ status: false, message: "Product Out Of Stock" });
      }

      const cart = await Cart.findOne({ userId });
      if (!cart) {
        const newCart = new Cart({
          userId,
          items: [
            {
              product_id: productId,
              variant: variantId,
              color,
              size,
              quantity: 1,
              price: product.price,
            },
          ],
        });

        await newCart.save();
        return res.json({
          status: true,
          count: 1,
        });
      }

      const itemIndex = cart.items.findIndex(
        (item) =>
          item.product_id.toString() === productId &&
          item.variant.toString() === variantId
      );

      if (itemIndex !== -1) {
        return res
          .status(400)
          .json({ status: false, message: "Product already in cart" });
      }

      cart.items.push({
        product_id: productId,
        variant: variantId,
        color,
        size,
        quantity: 1,
        price: product.price,
      });

      await cart.save();

      return res.json({
        status: true,
        count: cart.items.length,
      });
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
    const cart = await Cart.findOne({ userId }).populate("items.product_id");
    if (!cart) {
      return res.status(404).json({ status: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product_id._id.toString() === id &&
        item.variant.toString() === variant
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ status: false, message: "Item not found in cart" });
    }

    cart.items.splice(itemIndex, 1);
    let totalPrice = 0;

    for (let prod of cart.items) {
      prod.price = prod.product_id.sellingPrice * prod.quantity;
      totalPrice += prod.price; // Calculate total price
    }

    cart.totalPrice = totalPrice; // Update total price directly
    await cart.save();
    res.json({ status: true });
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
