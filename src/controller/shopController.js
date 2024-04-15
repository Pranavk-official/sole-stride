const mongoose = require("mongoose");
const Banner = require("../model/bannerSchema");
const Category = require("../model/categorySchema");
const Brand = require("../model/attributes/brandSchema");
const Product = require("../model/productSchema");
const Address = require("../model/addressSchema");
const Order = require("../model/orderSchema");


const bestSelling = require("../helpers/bestSelling");

module.exports = {
  getHome: async (req, res) => {
    const locals = {
      title: "SoleStride - Home",
    };
    let perPage = 9;
    let page = req.query.page || 1;

    const banners = await Banner.find({ isActive: true });
    const products = await Product.find({ isActive: true })
      .limit(9)
      .sort({ createdAt: -1 });
    const categories = await Category.find({ isActive: true });


    const bestSellingProducts = await bestSelling.getBestSellingProducts();
    const bestSellingBrands = await bestSelling.getBestSellingBrands();
    const bestSellingCategories = await bestSelling.getBestSellingCategories();

    res.render("index", {
      locals,
      banners,
      categories,
      products,
      bestSellingProducts,
      bestSellingBrands,
      bestSellingCategories,
      user: req.user,
    });
  },
  search: async (req, res, next) => {
    try {
      console.log(req.query);
      let search = "";

      if (req.query.search) {
        search = req.query.search.trim();
      }

      let page = 1;

      if (req.query.page) {
        page = req.query.page;
      }

      const categoryID = req.query.category;
      const brandID = req.query.brand;

      const limit = 9;

      const sortBy = req.query.sortBy;

      let sortQuery = {};

      if (sortBy) {
        if (sortBy === "lowPrice") {
          sortQuery = { sellingPrice: 1 };
        } else if (sortBy === "highPrice") {
          sortQuery = { sellingPrice: -1 };
        }
      }

      let filterQuery = {
        isActive: true,
      };

      if (search) {
        filterQuery.product_name = { $regex: search, $options: "i" };
      }

      if (categoryID && typeof categoryID !== undefined) {
        filterQuery.category = categoryID;
      }

      if (brandID) {
        filterQuery.brand = brandID;
      }
      const products = await Product.find(filterQuery)
        .sort(sortQuery)
        .populate("variants.color variants.size")
        .skip((page - 1) * limit)
        .limit(limit * 1)
        .exec();

      // console.log(products[0].variants);
      const count = await Product.find(filterQuery).countDocuments();

      const categories = await Category.find({ isActive: true });
      const brands = await Brand.find({});
      return res.render("shop/search.ejs", {
        sortBy,
        brandID,
        categoryID,
        brands,
        products,
        categories,
        count,
        pages: Math.ceil(count / limit),
        current: page,
        previous: page - 1,
        nextPage: Number(page) + 1,
        limit,
        search,
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
  getProduct: async (req, res) => {
    const productId = req.params.id;

    try {
      // Aggregation pipeline to find the product and populate related data
      const pipeline = [
        { $match: { _id: new mongoose.Types.ObjectId(productId) } }, // Use ObjectId for matching
        {
          $lookup: {
            from: "brands", // Assuming 'brands' is the correct collection name for brands
            localField: "brand",
            foreignField: "_id",
            as: "brand",
          },
        },
        { $unwind: "$brand" }, // Assuming there is only one brand per product
        {
          $lookup: {
            from: "categories", // Assuming 'categories' is the correct collection name for categories
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: "$category" }, // Assuming there is only one category per product
        {
          $lookup: {
            from: "colors", // Assuming 'colors' is the correct collection name for colors
            localField: "variants.color",
            foreignField: "_id",
            as: "variantColors",
          },
        },
        {
          $lookup: {
            from: "sizes", // Assuming 'sizes' is the correct collection name for sizes
            localField: "variants.size",
            foreignField: "_id",
            as: "variantSizes",
          },
        },
        {
          $project: {
            product_name: 1,
            brand: 1,
            category: "$category", // Use the populated 'category' object
            description: 1,
            details: 1,
            price: 1,
            actualPrice: 1,
            sellingPrice: 1,
            onSale: 1,
            reviews: 1,
            onOffer: 1,
            offerDiscountPrice: 1,
            offerDiscountRate: 1,
            isActive: 1,
            primary_image: 1,
            secondary_images: 1,
            variants: {
              $map: {
                input: "$variants",
                as: "variant",
                in: {
                  _id: "$$variant._id",
                  color: {
                    $arrayElemAt: [
                      "$variantColors",
                      {
                        $indexOfArray: [
                          "$variantColors._id",
                          "$$variant.color",
                        ],
                      },
                    ],
                  },
                  size: {
                    $arrayElemAt: [
                      "$variantSizes",
                      {
                        $indexOfArray: ["$variantSizes._id", "$$variant.size"],
                      },
                    ],
                  },
                  stock: "$$variant.stock",
                },
              },
            },
          },
        },
      ];

      // Execute the aggregation pipeline
      const productData = await Product.aggregate(pipeline);

      // check variant stock
      productData.forEach((product) => {
        product.variants.forEach((variant) => {
          if (variant.stock <= 0) {
            variant.isOutOfStock = true;
          }
        });
      });

      console.log(productData)
      // Assuming productData is an array with one or more objects
      // Assuming productData is an array with one or more objects
      // productData.forEach((product) => {
      //     console.log("Product Name:", product.product_name);
      //     console.log("Product Brand:", product.brand.name);

      //     product.variants.forEach((variant, index) => {
      //         console.log(`Variant ${ index + 1 }:`);
      //         console.log("Color:", variant.color);
      //         console.log("Size:", variant.size);
      //         console.log("Stock:", variant.stock);
      //         console.log("Varient ID", variant._id)
      //         console.log("---------------------------");
      //     });
      // })

      const relatedProducts = await Product.find({
        category: productData[0].category._id,
        isActive: true,
      })
        .populate("brand category")
        .limit(4);

      // console.log(relatedProducts);

      // Check if product data was found
      if (!productData || productData.length === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      // check if any of the variant is out of stock add a new boolean field outOfStock to the variant to be true
      productData[0].variants.forEach((variant) => {
        variant.outOfStock = variant.stock === 0;
      });

      // console.log(productData[0]);

      // Send the response with the populated product data
      res.render("shop/productDetail", {
        product: productData[0],
        related: relatedProducts,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getProductTest: async (req, res) => {
    const locals = {
      title: "SoleStride - Product",
    };
    res.render("shop/productPage", {
      locals,
    });
  },
  getProductList: async (req, res) => {
    const locals = {
      title: "SoleStride - Product",
    };

    let perPage = 12;
    let page = req.query.page || 1;

    const count = await Product.countDocuments();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    const products = await Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .populate("variants.$.color variants.$.size")
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    console.log(products[0]);
    const categories = await Category.find({ isActive: true });
    res.render("shop/productsList", {
      locals,
      products,
      categories,
      current: page,
      pages: Math.ceil(count / perPage),
      nextPage: hasNextPage ? nextPage : null,
    });
  },

  getContact: async (req, res) => {
    const locals = {
      title: "SoleStride - Contact Us",
    };
    res.render("contact", {
      locals,
    });
  },

  addAddress: async (req, res) => {
    console.log(req.body);
    await Address.create(req.body);
    req.flash("success", "Address Addedd");
    res.redirect("/checkout");
  },
  editAddress: async (req, res) => {
    try {
      const addressId = req.params.id;
      const updatedAddress = req.body;

      // Assuming you have a model for addresses, e.g., Address
      const address = await Address.findByIdAndUpdate(
        addressId,
        updatedAddress,
        {
          new: true, // returns the new document if true
        }
      );

      if (!address) {
        return res.status(404).send({ message: "Address not found" });
      }

      req.flash("success", "Address Edited");
      res.redirect("/checkout");
    } catch (error) {
      console.error(error);
      req.flash("error", "Error editing address. Please try again.");
      res.redirect("/checkout");
    }
  },
  deleteAddress: async (req, res) => {
    let id = req.params.id;
    try {
      // Check if the address is in use by any orders
      const order = await Order.findOne({ "address._id": id });
      if (order) {
        // If the address is in use, perform a soft delete by setting the delete boolean to true
        const result = await Address.findByIdAndUpdate(
          id,
          { delete: true },
          { new: true }
        );
        if (result) {
          res
            .status(200)
            .json({ message: "Address marked as deleted successfully" });
        } else {
          res.status(404).json({ message: "Address not found" });
        }
      } else {
        // If the address is not in use, proceed with the deletion
        const result = await Address.deleteOne({ _id: id });
        if (result.deletedCount === 1) {
          res.status(200).json({ message: "Address deleted successfully" });
        } else {
          res.status(404).json({ message: "Address not found" });
        }
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
