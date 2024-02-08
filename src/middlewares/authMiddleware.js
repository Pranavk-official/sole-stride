const User = require('../model/userSchema')
const OTP = require('../model/otpSchema')

module.exports = {
    isLoggedIn: (req, res, next) => {
        // console.log(req.user, req.isAuthenticated());
        if(req.isAuthenticated() && !req.user.isAdmin) {
            next()
        } else {
            res.redirect('/login')
        }
    },
    isLoggedOut: (req, res, next) => {
        if(req.isAuthenticated() && !req.user.isAdmin) {
            res.redirect('/')
        } else {
            next()
        }
    },


    isVerified: (req, res, next) => {
        // console.log(req.body)
        next()
        // if(req.isAuthenticated() && !req.user.isVerified) {
        //     res.redirect('/user/verify')
        // } else {
        //     next()
        // }
    },



    isAdmin: (req, res, next) => {
        if(req.isAuthenticated() && req.user.isAdmin) {
            next()
        } else {
            res.redirect('/admin')
        }
    },
    isAdminLoggedOut: (req, res, next) => {
        if(req.isAuthenticated() && req.user.isAdmin) {
            res.redirect('/admin')
        } else {
            next()
        }
    },
}