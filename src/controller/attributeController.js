const layout = "./layouts/adminLayout";
const Color = require("../model/attributes/colorSchema");
const Size = require("../model/attributes/sizeSchema");
const Brand = require("../model/attributes/brandSchema");

module.exports = {
  getAttributes: async (req, res) => {
    const colors = await Color.find();
    const sizes = await Size.find();
    const brands = await Brand.find();
    console.log(brands);
    res.render("admin/attributes/attributes", {
      colors,
      sizes,
      brands,
      layout,
    });
  },

  getColor: async (req, res) => {
    let id = req.params.id;
    try {
      const color = await Color.findById(id);
      if (color) {
        res.status(200).json(color);
      } else {
        res.status(404).json({ error: "Color not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch color" });
    }
  },
  getSize: async (req, res) => {
    let id = req.params.id;
    try {
      const size = await Size.findById(id);
      if (size) {
        res.status(200).json(size);
      } else {
        res.status(404).json({ error: "Size not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch size" });
    }
  },
  getBrand: async (req, res) => {
    let id = req.params.id;
    try {
      const brand = await Brand.findById(id);
      if (brand) {
        res.status(200).json(brand);
      } else {
        res.status(404).json({ error: "Size not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch brand" });
    }
  },
  addAttributes: async (req, res) => {
    console.log(req.body);
    try {
      const { colorName, colorHex, size, brand } = req.body;

      if (colorName && colorHex) {
        const newColor = new Color({
          name: colorName.toLowerCase(),
          hex: colorHex,
        });
        await newColor.save();
      }

      if (size) {
        const newSize = new Size({
          value: size,
        });

        await newSize.save();
      }
      if (brand) {
        const newBrand = new Brand({
          name: brand.toLowerCase(),
        });

        await newBrand.save();
      }

      //   res.status(200).json({ message: "Attributes added successfully" });
      req.flash("success", "Attributes added successfully");
      res.redirect("/admin/attributes");
    } catch (error) {
      // res.status(500).json({ error: "Failed to add attributes" });
      req.flash("error", "Failed to add attributes");
      res.redirect("/admin/attributes");
    }
  },
  editColor: async (req, res) => {
    let id = req.params.id;
    const { colorName, colorHex } = req.body;
    try {
      const color = await Color.findByIdAndUpdate(
        id,
        {
          name: colorName.toLowerCase(),
          hex: colorHex,
        },
        { new: true }
      );
      if (color) {
        // res.status(200).json(color);
        req.flash("success", "Editted Color attribute");
        res.redirect("/admin/attributes");
      } else {
        // res.status(404).json({ error: "Color not found" });
        req.flash("error", "Editted Color attribute");
        res.redirect("/admin/attributes");
      }
    } catch (error) {
      // res.status(500).json({ error: "Failed to edit color" });
      req.flash("error", "Failed to edit color");
      res.redirect("/admin/attributes");
    }
  },

  editSize: async (req, res) => {
    let id = req.params.id;
    const { size } = req.body;
    try {
      const sizeAttr = await Size.findByIdAndUpdate(
        id,
        {
          value: size,
        },
        { new: true }
      );
      if (sizeAttr) {
        res.status(200).json(sizeAttr);
      } else {
        res.status(404).json({ error: "Size not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to edit size" });
    }
  },
  editBrand: async (req, res) => {
    // console.log(req.params,req.body);
    let id = req.params.id;
    const { brand } = req.body;
    try {
      const newBrand = await Brand.findByIdAndUpdate(
        id,
        {
          name: brand.toLowerCase(),
        },
        { new: true }
      );
      console.log(newBrand);
      if (newBrand) {
        res.status(200).json(newBrand);
      } else {
        res.status(404).json({ error: "Brand not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to edit brand" });
    }
  },

  deleteColor: async (req, res) => {
    let id = req.params.id;
    try {
      const result = await Color.findByIdAndDelete(id);
      if (result) {
        res.status(200).json({ message: "Color deleted successfully" });
      } else {
        res.status(404).json({ error: "Color not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete color" });
    }
  },

  deleteSize: async (req, res) => {
    let id = req.params.id;
    try {
      const result = await Size.findByIdAndDelete(id);
      if (result) {
        res.status(200).json({ message: "Size deleted successfully" });
      } else {
        res.status(404).json({ error: "Size not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete size" });
    }
  },
  toggleListingColor: async (req, res) => {
    let id = req.params.id;
    try {
      const color = await Color.findById(id);
      if (color) {
        color.isDeleted = !color.isDeleted; // Toggle the listing status
        await color.save();
        let status = color.isDeleted ? "Unlisted" : "Listed";

        res
          .status(200)
          .json({
            color: color,
            message: `The Color : ${color.name} is ${status}`,
          });
      } else {
        res.status(404).json({ error: "Color not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle listing status" });
    }
  },

  toggleListingSize: async (req, res) => {
    let id = req.params.id;
    try {
      const size = await Size.findById(id);
      if (size) {
        size.isDeleted = !size.isDeleted; // Toggle the listing status
        await size.save();
        let status = size.isDeleted ? "Unlisted" : "Listed";
        res
          .status(200)
          .json({
            size: size,
            message: `The Size : ${size.value} is ${status}`,
          });
      } else {
        res.status(404).json({ error: "Size not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle listing status" });
    }
  },
  toggleListingBrand: async (req, res) => {
    let id = req.params.id;
    try {
      const brand = await Brand.findById(id);
      if (brand) {
        brand.isActive = !brand.isActive; // Toggle the listing status
        await brand.save();
        let status = brand.isActive ? "Unlisted" : "Listed";
        res
          .status(200)
          .json({
            brand: brand,
            message: `The Brand : ${brand.name} is ${status}`,
          });
      } else {
        res.status(404).json({ error: "Size not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle listing status" });
    }
  },
};
