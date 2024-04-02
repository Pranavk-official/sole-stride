const Product = require('../model/productSchema');
const mongoose = require('mongoose');


module.exports = {
    getUserReviews: async(req,res) =>{

    },
    postReview: async(req,res) =>{
        console.log(req.body);

        try {
            const product = await Product.findOne({ _id: req.body.product_id });

            if (!product) {
                return res.status(404).json({message: "Product not found", success: false});
            }

            const review = {
                rating: req.body.rating,
                comment: req.body.review,
                product: {
                    id: product._id,
                    name: product.product_name,
                    color: req.body.color,
                    size: req.body.size
                },
                user: {
                    user_id: req.user.id,
                    name: req.user.username,
                    email: req.user.email
                },
                date: Date.now()
            };

            product.reviews.push(review);
            await product.save();
            res.status(201).json({message: "Review posted successfully", success: true, review});

        } catch (error) {
            console.log(error);
            res.status(500).json({message: "Internal server error", success: false, error});
        }
    },
    editReview: async(req,res) =>{

    },
    deleteReview: async(req,res) =>{

    },
}