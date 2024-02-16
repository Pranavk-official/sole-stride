const adminLayout = './layouts/adminLayout.ejs'


module.exports = {
    getDashboard: async (req,res) => {
        const locals = {
            title : 'SoleStride - Dashboard'
        }

        console.log(req.user);

        res.render('admin/dashboard',{
            locals,
            admin: req.user,
            layout: adminLayout
        })
    },
    getUsersList: async (req,res) => {
        const locals = {
            title : 'SoleStride - Customers'
        }

        res.render('admin/users/users',{
            locals,
            layout: adminLayout
        })
    },
}