const Banner = require("../model/bannerSchema");
const Category = require("../model/categorySchema");
const Product = require("../model/productSchema");
const Address = require("../model/addressSchema");
const User = require("../model/userSchema");

module.exports = {
  getHome: async (req, res) => {
    const locals = {
      title: "SoleStride - Home",
    };
    const banners = await Banner.find({ isActive: true });
    const products = await Product.find({ isActive: true }).limit(9);
    const categories = await Category.find({ isActive: true });

    console.log(categories);
    res.render("index", {
      locals,
      banners,
      categories,
      products,
      user: req.user,
      error: req.flash("error"),
      success: req.flash("success"),
    });
  },
  getProduct: async (req, res) => {

    const product = await Product.findOne({_id: req.params.id, isActive: true})
    console.log(product);
    const locals = {
      title: "SoleStride - Product",
    };
    res.render("shop/productDetail", {
      locals,
      product
    });
  },
  getProductTest: async (req, res) => {
    const locals = {
      title: "SoleStride - Product",
    };
    res.render("shop/productPage", {
      locals,
    });
  },
  getProductList: async (req, res) => {
    const locals = {
      title: "SoleStride - Product",
    };
    const products = await Product.find({ isActive: true });
    const categories = await Category.find({ isActive: true });
    res.render("shop/productsList", {
      locals,
      products,
      categories,
    });
  },
  getCheckout: async (req, res) => {
    if(!req.isAuthenticated()){
      return res.redirect('/login')
    }
    
    if(req.user.cart.length < 1){
        return res.redirect('/cart')
    }
    const address = await Address.find({ customer_id: req.user.id, delete: false });
    let user = await User.findById(req.user.id);
    console.log(address);

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
    
    const locals = {
      title: "SoleStride - Checkout",
    };
    res.render("shop/checkout", {
      locals,
      user,
      address,
      cartList,
      cartCount,
      totalPrice,
      checkout: true,
    });
  },
  getContact: async (req, res) => {
    const locals = {
      title: "SoleStride - Contact Us",
    };
    res.render("contact", {
      locals,
    });
  },

  addAddress: async (req,res) => {
    console.log(req.body);
    await Address.create(req.body)
    req.flash('success', 'Address Addedd')
    res.redirect('/checkout')
  }
};
