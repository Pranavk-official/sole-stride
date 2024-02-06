module.exports = {
    getLogin: async(req,res) => {
        const locals = {
            title: 'SoleStride - Login'
        }

        res.render('auth/user/login', {
            locals
        })
    },
    getRegister: async(req,res) => {
        const locals = {
            title: 'SoleStride - Register'
        }

        res.render('auth/user/register', {
            locals
        })
    },
    getVerifyOtp: async(req,res) => {
        const locals = {
            title: 'SoleStride - Register'
        }

        res.render('auth/user/verifyOtp', {
            locals
        })
    },
    getForgotPass: async(req,res) => {
        const locals = {
            title: 'SoleStride - Forgot Password'
        }
        res.render('auth/user/forgotPassword', {

            locals
        })
    },
}