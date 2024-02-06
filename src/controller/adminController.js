const adminLayout = './layouts/adminLayout.ejs'


module.exports = {
    getDashboard: async (req,res) => {
        const locals = {
            title : 'SoleStride - Dashboard'
        }

        res.render('admin/dashboard',{
            locals,
            layout: './layouts/adminLayout'
        })
    },
}