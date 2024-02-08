const User = require('../model/userSchema')

module.exports = {
    getProfile: async(req,res) => {
        const locals = {
            title: 'SoloStride - Profile'
        }

        res.render('user/profile', {
            locals,
            user: req.user
        })
    },
    editProfile: async(req,res) => {
        console.log(req.body);
    },

    getAddress: async(req,res) => {
        const locals = {
            title: 'SoloStride - Profile'
        }
        
        res.render('user/address', {
            locals,
            user: req.user
        })
    },
    getOrders: async(req,res) => {
        const locals = {
            title: 'SoloStride - Profile'
        }
        res.render('user/orders', {
            locals,
            user: req.user
        })
    },
    getOrder: async(req,res) => {
        const locals = {
            title: 'SoloStride - Profile'
        }
        res.render('user/orderDetail', {
            locals,
            user: req.user
        })
    },
    getWishlist: async(req,res) => {
        const locals = {
            title: 'SoloStride - Wishlist'
        }
        res.render('user/wishlist', {
            locals,
            user: req.user
        })
    },
}