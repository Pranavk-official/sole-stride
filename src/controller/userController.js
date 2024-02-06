module.exports = {
    getProfile: async(req,res) => {
        const locals = {
            title: 'SoloStride - Profile'
        }
        res.render('user/profile', {
            locals
        })
    },
    getAddress: async(req,res) => {
        const locals = {
            title: 'SoloStride - Profile'
        }
        res.render('user/address', {
            locals
        })
    },
    getOrders: async(req,res) => {
        const locals = {
            title: 'SoloStride - Profile'
        }
        res.render('user/orders', {
            locals
        })
    },
    getOrder: async(req,res) => {
        const locals = {
            title: 'SoloStride - Profile'
        }
        res.render('user/orderDetail', {
            locals
        })
    },
    getWishlist: async(req,res) => {
        const locals = {
            title: 'SoloStride - Wishlist'
        }
        res.render('user/wishlist', {
            locals
        })
    },
}