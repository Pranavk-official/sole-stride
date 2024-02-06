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

        res.render('user/register', {
            locals
        })
    }
}