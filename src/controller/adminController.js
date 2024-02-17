const adminLayout = "./layouts/adminLayout.ejs";
const User = require("../model/userSchema");
const Product = require("../model/productSchema");
const Orders = require("../model/orderSchema");

module.exports = {
  getDashboard: async (req, res) => {
    const locals = {
      title: "SoleStride - Dashboard",
    };

    // console.log(req.user);
    const users = await User.find();
    const usersCount = await User.find().countDocuments();

    const products = await Product.find();
    const productsCount = await Product.find().countDocuments();

    res.render("admin/dashboard", {
      locals,
      users,
      usersCount,
      products,
      productsCount,
      admin: req.user,
      layout: adminLayout,
    });
  },
  getUsersList: async (req, res) => {
    const locals = {
      title: "SoleStride - Customers",
    };

    let perPage = 12;
    let page = req.query.page || 1;

    const users = await User.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    const count = await User.countDocuments();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render("admin/users/users", {
      locals,
      users,
      current: page,
      pages: Math.ceil(count / perPage),
      nextPage: hasNextPage ? nextPage : null,
      currentRoute: "/admin/users/",
      layout: adminLayout,
    });
  },
};
