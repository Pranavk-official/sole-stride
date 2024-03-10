const mongoose = require("mongoose");
const Banner = require("../model/bannerSchema");
const Category = require("../model/categorySchema");
const Product = require("../model/productSchema");
const Address = require("../model/addressSchema");
const User = require("../model/userSchema");

// Function to check if a product exists and is active
const checkProductExistence = async (cartItem) => {
  const product = await Product.findById(cartItem.product_id);
  if (!product || !product.isActive) {
    throw new Error(`${product.product_name}`);
  }
  return product;
};

// Function to check if the stock is sufficient for a product
const checkStockAvailability = async (cartItem) => {
  const product = await Product.findById(cartItem.product_id);
  const variant = product.variants.find(
    (variant) => variant._id.toString() === cartItem.variant.toString()
  );
  if (variant.stock < cartItem.quantity) {
    throw new Error(`${product.product_name}`);
  }
  return product;
};

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

    res.render("index", {
      locals,
      banners,
      categories,
      products,
      user: req.user,
      error: req.flash("error"),
      success: req.flash("success"),
    });
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
            price: 1,
            actualPrice: 1,
            sellingPrice: 1,
            onSale: 1,
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
      // console.log(productData)
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

      // Check if product data was found
      if (!productData || productData.length === 0) {
        return res.status(404).json({ message: "Product not found" });
      }
      let wishlistCount;
      // Send the response with the populated product data
      res.render("shop/productDetail", { product: productData[0] });
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
  getCheckout: async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.redirect("/login");
    }

    if (req.user.cart.length < 1) {
      return res.redirect("/user/cart");
    }

    let user = await User.findById(req.user.id);

    // Correctly use map with async functions
    const productExistencePromises = user.cart.map(checkProductExistence);
    const productExistenceResults = await Promise.allSettled(
      productExistencePromises
    );

    // Filter out the rejected promises to identify which items are not valid
    const invalidCartItems = productExistenceResults
      .filter((result) => result.status === "rejected")
      .map((result) => result.reason);


    if (invalidCartItems.length > 0) {
      console.log(invalidCartItems);
      req.flash(
        "error",
        `The following items are not available: ${invalidCartItems.join(", ").replaceAll('Error:', '')}`
      );

      return res.redirect("/user/cart");

      //  return res.status(400).json({
      //    message: `The following items are not available: ${invalidCartItems.join(
      //      ", "
      //    )}`,
      //  });
    }

    // Correctly use map with async functions
    const stockAvailabilityPromises = user.cart.map(checkStockAvailability);
    const stockAvailabilityResults = await Promise.allSettled(
      stockAvailabilityPromises
    );

    // Filter out the rejected promises to identify which items have insufficient stock
    const insufficientStockItems = stockAvailabilityResults
      .filter((result) => result.status === "rejected")
      .map((result) => result.reason);

    if (insufficientStockItems.length > 0) {
      console.log(insufficientStockItems)
      req.flash(
        "error",
        `Insufficient stock for the following items: ${insufficientStockItems.join(
          ", "
        ).replaceAll('Error: ', '')}`
      );

      return res.redirect("/user/cart");
      //  return res.status(400).json({
      //    message: `Insufficient stock for the following items: ${insufficientStockItems.join(
      //      ", "
      //    )}`,
      //  });
    }

    const address = await Address.find({
      customer_id: req.user.id,
      delete: false,
    });

    console.log(address);

    let cartList = await User.aggregate([
      { $match: { _id: user._id } },
      { $project: { cart: 1, _id: 0 } },
      { $unwind: { path: "$cart" } },
      {
        $lookup: {
          from: "products",
          localField: "cart.product_id",
          foreignField: "_id",
          as: "prod_details",
        },
      },
      { $unwind: { path: "$prod_details" } },
    ]);

    let totalPrice = 0;
    for (let prod of cartList) {
      prod.price = prod.prod_details.sellingPrice * prod.cart.quantity;
      totalPrice += prod.price; // Calculate total price
    }

    let cartCount = req.user.cart.length; // Update cartCount

    const locals = {
      title: "SoleStride - Checkout",
    };
    res.render("shop/checkout", {
      locals,
      user,
      address,
      cartList,
      cartCount,
      totalPrice,
      checkout: true,
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
      const result = await Address.deleteOne({ _id: id });
      if (result.deletedCount === 1) {
        // If the document was successfully deleted, send a success response
        res.status(200).json({ message: "Address deleted successfully" });
      } else {
        // If no document was found to delete, send an appropriate response
        res.status(404).json({ message: "Address not found" });
      }
    } catch (error) {
      // Handle any errors that occurred during the database operation
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
