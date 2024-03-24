const User = require("../model/userSchema");
const Cart = require("../model/cartSchema");
const Wishlist = require("../model/wishlistSchema");
const Order = require("../model/orderSchema");

module.exports = {
  cartList: async (req, res, next) => {
    if (req.isAuthenticated() && !req.user.isAdmin) {
      let user = await User.findById(req.user.id);
      let userCart = await Cart.findOne({userId: req.user.id}).populate('items.product_id items.color items.size');

      if (userCart) {
        res.locals.cartCount = userCart && userCart.items ? userCart.items.length : 0;
        let totalPrice = 0;
      for (let prod of userCart.items) {
        prod.price = prod.product_id.sellingPrice * prod.quantity;
        totalPrice += prod.price; // Calculate total price
        // console.log(prod.price);
      }


      
      const userWishlist = await Wishlist.findOne({ userId: req.user.id });
      const userOrder = await Order.find({ customer_id: req.user.id }).countDocuments();
  
      res.locals.orderCount = userOrder ? userOrder : 0;
      res.locals.wishlistCount = userWishlist ? userWishlist.products.length : 0;

      // console.log(cartEntries);
      res.locals.cartCount = userCart.items.length
      res.locals.cartEntries = userCart.items;
      res.locals.cartTotalPrice = totalPrice;
    } else {
        res.locals.cartCount = 0
        res.locals.cartEntries = [];
        res.locals.cartTotalPrice = 0;
        res.locals.cartCount = 0;
      }
 
    }
    next();
  },
};
