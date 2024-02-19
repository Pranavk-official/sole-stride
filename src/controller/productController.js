const layout = './layouts/adminLayout.ejs'
const Product = require('../model/productSchema')
const Category = require('../model/categorySchema')


module.exports = {
    getAllProducts: async (req,res) =>{
        console.log(req.session);
        const products = await Product.find()
        res.render('admin/products/products', {
            layout,
            products,
        })
    },
    getAddProduct: async (req,res) =>{
        const categories = await Category.find({isActive: true})
        res.render('admin/products/addProduct', {
            layout,
            categories
        })
    },
    getEditProduct: async (req,res) =>{
        const product = await Product.findById(req.params.id)
        const categories = await Category.find({isActive: true})
        res.render('admin/products/editProduct', {
            layout,
            product,
            categories
        })
    },
    addProduct: async (req,res) =>{
        try {
            let seconaryImages = []
            req.files.images.forEach((e) => {
                seconaryImages.push({
                    name: e.filename,
                    path: e.path
                })
            });
    
            let PrimaryImage;
            req.files.primaryImage.forEach((e) => {
                PrimaryImage = {
                    name: e.filename,
                    path: e.path
                }
            });
    
            const product = new Product({
                product_name: req.body.product_name,
                brand_name: req.body.brand_name,
                description: req.body.description,
                category: req.body.category,
                stock: req.body.stock,
                size: req.body.size,
                actualPrice: req.body.actualPrice,
                sellingPrice: req.body.sellingPrice,
                color: req.body.product_color,
                primary_image: PrimaryImage,
                secondary_images: seconaryImages
            })
            const saved = await product.save()
            if (saved) {
                req.flash('success', 'New product Added Sucessfully');
                res.json({
                    success: true
                })
            }
        } catch (error) {
            res.status(400).send(error)
        }
    },
    editProduct: async (req,res) =>{
        try {
            console.log(req.body,req.params.id);
            const product = await Product.findOne({ _id: req.params.id });
            console.log(product);
            if (req.files != null) {
                const id_secondary_img = req.body.id_secondary_img
                const primaryImage = product.primary_image
    
                const primaryimagejs = req.files.primaryImage
                if (primaryimagejs) {
                    primaryImage[0].name = primaryimagejs[0].filename
                    primaryImage[0].path = primaryimagejs[0].path
                }
    
                const secondaryImage = product.secondary_images
                const secodaryimagejs = req.files.images
    
                if (secodaryimagejs) {
                    for (let i = 0; i < secodaryimagejs.length; i++) {
                        if (id_secondary_img[i] == secondaryImage[i]._id) {
                            secondaryImage[i].name = secodaryimagejs[i].filename;
                            secondaryImage[i].path = secodaryimagejs[i].path;
                        }
                    }
    
                }
            }
    
            const categoryID = req.body.category
            product.product_name = req.body.product_name;
            product.brand_name = req.body.brand_name;
            product.description = req.body.description;
            product.category = categoryID;
            product.stock = req.body.stock;
            product.actualPrice = req.body.actualPrice;
            product.sellingPrice = req.body.sellingPrice;
            product.color = req.body.product_color;
            product.isActive = req.body.status;
            product.size = req.body.size;
    
            const productUpdate = await Product.findByIdAndUpdate({ _id: req.params.id }, product);
            // req.flash('success', 'product editted successfully')
            if (productUpdate) {
                req.flash('success', 'product editted successfully')
                res.redirect('/admin/products')
            }
        } catch (err) {
            console.log(err)
        }
    },
    deleteProduct: async (req,res) =>{
        console.log(req.body);
    },
    
}