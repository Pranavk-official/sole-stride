const Banner = require('../model/bannerSchema')
const Category = require('../model/categorySchema')
const Product = require('../model/productSchema')

module.exports = {
    getHome: async (req,res) => {
        const locals = {
            title: 'SoleStride - Home'
        }
        const banners = await Banner.find({ isActive: true });
        const categories = await Category.find({ isActive: true });

        console.log(categories);
        res.render('index', {
            locals,
            banners,
            categories,
            user: req.user ,
            error: req.flash('error'),
            success: req.flash('success')
        })
    },
    getCart: async (req,res) => {
        const locals = {
            title: 'SoleStride - Cart'
        }
        res.render('shop/cart', {
            locals,
            user: req.user
        })
    },
    getProduct: async (req,res) => {
        const locals = {
            title: 'SoleStride - Product'
        }
        res.render('shop/productDetail', {
            locals
        })
    },
    getProductTest: async (req,res) => {
        const locals = {
            title: 'SoleStride - Product'
        }
        res.render('shop/productPage', {
            locals
        })
    },
    getProductList: async (req,res) => {
        const locals = {
            title: 'SoleStride - Product'
        }
        const products = await Product.find({isActive: true})
        const categories = await Category.find({isActive: true})
        res.render('shop/productsList', {
            locals,
            products,
            categories
        })
    },
    getCheckout: async (req,res) => {

        // if(req.user.cart.length < 1){
        //     return res.redirect('/cart')
        // }

        const locals = {
            title: 'SoleStride - Checkout'
        }
        res.render('shop/checkout', {
            locals
        })
    },
    getContact: async (req,res) => {
        const locals = {
            title: 'SoleStride - Contact Us'
        }
        res.render('contact', {
            locals
        })
    },
}