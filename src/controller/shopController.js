module.exports = {
    getHome: async (req,res) => {
        const locals = {
            title: 'SoleStride - Home'
        }
        res.render('index', {
            locals
        })
    },
    getCart: async (req,res) => {
        const locals = {
            title: 'SoleStride - Cart'
        }
        res.render('shop/cart', {
            locals
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
        res.render('shop/productsList', {
            locals
        })
    },
    getOrder: async (req,res) => {
        const locals = {
            title: 'SoleStride - Order'
        }
        res.render('shop/order', {
            locals
        })
    },
    getOrders: async (req,res) => {
        const locals = {
            title: 'SoleStride - Orders'
        }
        res.render('shop/orders', {
            locals
        })
    },
    getCheckout: async (req,res) => {
        const locals = {
            title: 'SoleStride - Orders'
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