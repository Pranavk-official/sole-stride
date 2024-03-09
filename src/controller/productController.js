const fs = require("fs");
const path = require("path");

const layout = "./layouts/adminLayout.ejs";
const Product = require("../model/productSchema");
// const Variant = require("../model/productVariation");
const Category = require("../model/categorySchema");
const Color = require("../model/attributes/colorSchema");
const Size = require("../model/attributes/sizeSchema");
const Brands = require("../model/attributes/brandSchema");

module.exports = {
  getAllProducts: async (req, res) => {
    let perPage = 9;
    let page = req.query.page || 1;

    const products = await Product.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    const count = await Product.find().countDocuments();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render("admin/products/products", {
      layout,
      products,
      current: page,
      pages: Math.ceil(count / perPage),
      nextPage: hasNextPage ? nextPage : null,
      currentRoute: "/user/products/",
    });
  },
  getAddProduct: async (req, res) => {
    const categories = await Category.find({ isActive: true });
    const colors = await Color.find({ isDeleted: false });
    const sizes = await Size.find({ isDeleted: false });
    const brands = await Brands.find({ isActive: false });

    res.render("admin/products/addProduct", {
      layout,
      brands,
      categories,
      colors,
      sizes,
    });
  },
  getEditProduct: async (req, res) => {
    const product = await Product.findById(req.params.id)
      .populate("category")
      .populate("brand");
    const categories = await Category.find({ isActive: true });
    const brands = await Brands.find({ isActive: false });

    // console.log(product);
    res.render("admin/products/editProduct", {
      layout,
      product,
      brands,
      categories,
    });
  },

  addProduct: async (req, res) => {
    try {
      console.log(req.body, req.files);

      const variants = [];

      // Iterate over the keys in the request body
      for (const key in req.body) {
        // Check if the key starts with 'variants['
        if (key.startsWith("variants[")) {
          // Extract the variant index and property from the key
          const match = key.match(/variants\[(\d+)\]\.(.+)/);
          if (match) {
            const index = parseInt(match[1], 10);
            const property = match[2];

            // Initialize the variant object if it doesn't exist
            if (!variants[index]) {
              variants[index] = {};
            }

            // Assign the value to the variant object
            variants[index][property] = req.body[key];
          }
        }
      }
      console.log(variants);

      // Check for duplicate color and size combinations
      const uniqueCombinations = new Set();
      for (const variant of variants) {
        const combination = `${variant.color}-${variant.size}`;
        if (uniqueCombinations.has(combination)) {
          // Duplicate found, respond with an error
          return res.status(400).json({
            success: false,
            message: "Duplicate variant color and size combination found.",
          });
        }
        uniqueCombinations.add(combination);
      }

      // Save each variant and collect their IDs in an array of objects with key variantId
      // const variantIds = [];
      // for (const variant of variants) {
      //   const variantModel = new Variant(variant); // Assuming Variant is your model for variants
      //   const savedVariant = await variantModel.save();
      //   variantIds.push({ variantId: savedVariant._id });
      // }

      let seconaryImages = [];
      req.files.images.forEach((e) => {
        seconaryImages.push({
          name: e.filename,
          path: e.path,
        });
      });

      let PrimaryImage;
      req.files.primaryImage.forEach((e) => {
        PrimaryImage = {
          name: e.filename,
          path: e.path,
        };
      });

      const product = new Product({
        product_name: req.body.product_name,
        brand: req.body.brand,
        description: req.body.description,
        category: req.body.category,
        variants: variants,
        actualPrice: req.body.actualPrice,
        sellingPrice: req.body.sellingPrice,
        primary_image: PrimaryImage,
        secondary_images: seconaryImages,
      });

      await product.save();
      // Example response for successful creation
      res.status(200).json({
        success: true,
        message: "Product added successfully.",
      });
    } catch (error) {
      // Handle any errors
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error.",
      });
    }
  },
  editProduct: async (req, res) => {
    try {
      console.log(req.files, req.body);
      const productId = req.params.id;
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Prepare the update object
      const update = {
        product_name: req.body.product_name,
        brand: req.body.brand,
        description: req.body.description,
        category: req.body.category || product.category,
        actualPrice: req.body.actualPrice,
        sellingPrice: req.body.sellingPrice,
        isActive: req.body.status,
      };

      // Handle primary image
      if (req.files.primaryImage) {
        // Delete the old primary image if it exists
        if (product.primary_image && product.primary_image.name) {
          fs.unlink(
            path.join(__dirname, "../../public/uploads/product-images/") +
              product.primary_image.name,
            (err) => {
              if (err) console.error(err);
            }
          );
        }

        const primaryImage = req.files.primaryImage[0];
        update.primary_image = {
          name: primaryImage.filename,
          path: primaryImage.path,
        };
      }

      update.secondary_images = [...product.secondary_images];
      // Handle secondary images
      if (req.files.images) {
        for (let i = 0; i < req.files.images.length; i++) {
          if (
            req.body.id_secondary_img[i] == product.secondary_images[i]?._id
          ) {
            update.secondary_images[i].name = req.files.images[i].filename;
            update.secondary_images[i].path = req.files.images[i].path;

            // Delete old secondary images if they exist
            if (
              product.secondary_images &&
              product.secondary_images.length > 0
            ) {
              product.secondary_images.forEach((image) => {
                fs.unlink(
                  path.join(__dirname, "../../public/uploads/product-images/") +
                    image.name,
                  (err) => {
                    if (err) console.error(err);
                  }
                );
              });
            }
          }
        }
      }
      // if (req.files.images) {
      //   update.secondary_images = req.files.images.map((image) => ({
      //     name: image.filename,
      //     path: image.path,
      //   }));
      // }

      // Perform the update operation
      const updatedProduct = await Product.updateOne(
        { _id: productId },
        update,
        { new: true }
      );

      // if (!updatedProduct) {
      //   return res.status(500).json({ message: "Failed to update product" });
      // }

      req.flash("success", "Product edited successfully");
      res.redirect("/admin/products");
    } catch (error) {
      console.error(error);
      req.flash("error", error.message);
      res.redirect("/admin/products");
    }
  },

  /**
   * Varinat Product Stock Management
   */

  getStocks: async (req, res) => {
    try {
      const products = await Product.find()
        .sort({ createdAt: -1 })
        .populate("brand")
        .populate("category")
        .populate("variants.color")
        .populate("variants.size");
      // console.log(products);
      console.log(products[0]);
      res.render("admin/products/stocks", {
        products,
        layout,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  updateStock: async (req, res) => {
    try {
      console.log(req.body);
      const { variantId, stock } = req.body;

      // First, check if the product and variant exist
      const product = await Product.findOne({ "variants._id": variantId });
      if (!product) {
        return res
          .status(404)
          .json({ message: "Product or variant not found." });
      }

      // Attempt to update the stock
      const updateVariantStock = await Product.findOneAndUpdate(
        { "variants._id": variantId },
        { $set: { "variants.$.stock": stock } },
        { new: true }
      );

      // Check if the update was successful
      if (updateVariantStock) {
        res.json({
          message: "Stock updated successfully.",
          product: updateVariantStock,
        });
      } else {
        res.status(400).json({ message: "Failed to update stock." });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while updating the stock." });
    }
  },

  deleteProduct: async (req, res) => {
    console.log(req.params);

    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Delete primary image
      if (product.primary_image && product.primary_image.path) {
        fs.unlink(
          path.join(__dirname, "..", product.primary_image.path),
          (err) => {
            if (err) console.error(err);
          }
        );
      }

      // Delete secondary images
      if (product.secondary_images && product.secondary_images.length > 0) {
        product.secondary_images.forEach((image) => {
          fs.unlink(path.join(__dirname, "..", image.path), (err) => {
            if (err) console.error(err);
          });
        });
      }

      // Delete the product from the database
      await Product.deleteOne({ _id: req.params.id });
      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // List / Unlist - Products (Soft Delete)
  toggleListing: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      product.isActive = !product.isActive;
      await product.save();
      res.status(200).json({
        message: product.isActive
          ? "Product listed successfully"
          : "Product unlisted successfully",
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  },

  // Delete Individual Images
  deleteImage: async (req, res) => {
    try {
      const product = await Product.findById(req.query.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const imageId = req.query.imageId; // Assuming you have an imageId query
      let imageToDelete;

      // Check if the image is a primary image
      if (product.primary_image.name === imageId) {
        imageToDelete = product.primary_image;
        product.primary_image.name = ""; // Remove reference to the primary image
        product.primary_image.path = ""; // Remove reference to the primary image
      } else {
        // Check if the image is a secondary image
        const secondaryImageIndex = product.secondary_images.findIndex(
          (image) => image.name === imageId
        );
        if (secondaryImageIndex !== -1) {
          imageToDelete = product.secondary_images[secondaryImageIndex];
          // product.secondary_images.splice(secondaryImageIndex, 1); // Remove the secondary image from the array
          product.secondary_images[secondaryImageIndex].name = "";
          product.secondary_images[secondaryImageIndex].path = "";
        } else {
          return res.status(404).json({ message: "Image not found" });
        }
      }

      // Delete the image file from the server
      fs.unlink(
        path.join(__dirname, "../../public/uploads/product-images") +
          imageToDelete.name,
        (err) => {
          if (err) {
            console.error(err);
            // return res
            //   .status(500)
            //   .json({ message: "Failed to delete image file" });
          }
        }
      );

      // Save the updated product document
      await product.save();
      res.status(200).json({ message: "Image deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
};
