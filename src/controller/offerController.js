const Product = require('../model/productSchema')
const Category = require('../model/categorySchema')
const Offer = require('../model/offerSchema')


const layout = './layouts/adminLayout'


module.exports = {
    getOffers: async(req,res) => {
        res.render('admin/offers', {
            offers: [],
            referral: {},
            layout
        })
    },
    getProductOffers: async(req,res) => {

        const products = await Product.find({})
        const offers = await Offer.find({})
        res.render('admin/offers/products', {
            products,
            layout
        })
    },
    /**
     * Retrieves all categories and renders the admin/offers/products view with the categories data.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @return {Promise<void>} - A promise that resolves when the view is rendered.
     */
    getCategoryOffers: async(req,res) => {

        const categories = await Category.find({})

        res.render('admin/offers/categories', {
            categories,
            layout
        })
    },
    /**
     * Adds a product offer.
     *
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @return {Object} The response object.
     */
    addProdOffer: async(req,res) => {

        const productId = req.params.id;
        const {offerDiscountRate} = req.body;

        if (!productId || !offerDiscountRate) {
            return res.status(400).json({success: false, message: "Missing parameters"});
        }

        if (isNaN(offerDiscountRate) || offerDiscountRate < 0) {
            return res.status(400).json({success: false, message: "Discount rate should be positive"});
        }

        try {
            const product = await Product.findById(productId);

            if (!product) {
                return res.status(404).json({success: false, message: "Product not found"});
            }

            let discountAmount = 0

            if (offerDiscountRate !== 0) {
                discountAmount =  Math.ceil((product.sellingPrice * offerDiscountRate) / 100);

            } else {
                discountAmount = product.sellingPrice
            }

            product.offerDiscountPrice = product.sellingPrice - discountAmount;
            product.offerDiscountRate = offerDiscountRate;

            await product.save();

            return res.status(200).json({success: true, message: "Offer added successfully"});
        } catch (error) {
            console.error(error);
            return res.status(500).json({success: false, message: "Internal Server Error", error});
        }
    },
    
    addCatOffer: async(req,res) => {
        const categoryId = req.params.id;
        const {offerDiscountRate} = req.body;

        if (!categoryId || !offerDiscountRate) {
            return res.status(400).json({success: false, message: "Missing parameters"});
        }

        if (isNaN(offerDiscountRate) || offerDiscountRate < 0) {
            return res.status(400).json({success: false, message: "Discount rate should be positive"});
        }

        try {
            
            const category = await Category.findById(categoryId);
            if (!category) {
                return res.status(404).json({success: false, message: "Category not found"});
            }  

            category.offerDiscountRate = offerDiscountRate;
            category.onOffer = true;
            await category.save();

            const productsInCategory = await Product.find({category: categoryId});
            if (!productsInCategory) {
                return res.status(404).json({success: false, message: "Products not found in this category"});
            }   

            if (productsInCategory.length === 0) {
                return res.status(404).json({success: false, message: "No products found in this category"});
            }   
            
            for(const product of productsInCategory) {
                const discountAmount =  Math.ceil((product.sellingPrice * offerDiscountRate) / 100);
                const offerPrice = Math.ceil(product.sellingPrice - discountAmount)
                product.offerDiscountPrice = offerPrice;
                product.offerDiscountRate = offerDiscountRate;
                product.onOffer = true;

                await product.save();
            }

            return res.status(200).json({sucess: true, message: "Offer added successfully"});
        
        } catch (error) {
            console.error(error);
            return res.status(500).json({success: false, message: "Internal Server Error", error});
        }
    },
    
    toggleActiveCatOffer: async (req,res) => {
        const categoryId = req.params.id;

        try {
            const category = await Category.findById(categoryId);

            if (!category) {
                return res.status(404).json({success: false, message: "Category not found"});
            }  

            const productsInCategory = await Product.find({category: categoryId});
            if (!productsInCategory) {
                return res.status(404).json({success: false, message: "Products not found in this category"});
            }  

            if(productsInCategory.length === 0) {  
                return res.status(404).json({success: false, message: "No products found in this category"});
            }

            category.onOffer = !category.onOffer;

            await category.save();

            for(const product of productsInCategory){
                product.onOffer = category.onOffer;
                await product.save();
            }

            return res.status(200).json({success: true, message: category.onOffer ? "Offer enabled" : "Offer disabled"});
        
        } catch (error) {
            console.error(error);
            return res.status(500).json({success: false, message: "Internal Server Error", error});   
        }
    },

    /**
     * A function to toggle the active status of a product.
     *
     * @param {Object} req - the request object
     * @param {Object} res - the response object
     * @return {Object} JSON response indicating success or failure of toggling the product's active status
     */
    toggleActiveProdOffer: async(req,res) => {
        const productId = req.params.id;

        try {
            const product = await Product.findById(productId);
    
            if (!product) {
                return res.status(404).json({success: false, message: "Product not found"});
            }

            product.onOffer = !product.onOffer;
    
            await product.save();
    
            return res.status(200).json({success: true, message: product.onOffer ? "Offer enabled" : "Offer disabled"});
        
        } catch (error) {
            console.error(error);
            return res.status(500).json({success: false, message: "Internal Server Error", error});
        }
    },
}