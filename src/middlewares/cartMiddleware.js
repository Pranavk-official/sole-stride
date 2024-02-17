const User = require("../model/userSchema");

module.exports = {
  cartList: async (req, res, next) => {
    if (req.isAuthenticated()) {
      let user = await User.findById(req.user.id);

      const cartEntries = await User.aggregate([
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
      for (let prod of cartEntries) {
        prod.price = prod.prod_details.sellingPrice * prod.cart.quantity;
        totalPrice += prod.price; // Calculate total price
        // console.log(prod.price);
      }

    //   console.log(req.user.id);

      res.locals.cartEntries = cartEntries;
      res.locals.cartTotalPrice = totalPrice;
    }
    next();
  },
};
