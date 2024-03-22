const fs = require("fs");

const layout = "./layouts/adminLayout.ejs";
const Banner = require("../model/bannerSchema");

module.exports = {
  getAllBanner: async (req, res) => {
    const locals = {
      title: "Banner Management",
    };

    let perPage = 5;
    let page = req.query.page || 1;

    const banners = await Banner.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    const count = await Banner.find().countDocuments();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render("admin/banners/banners", {
      locals,
      banners,
      layout,
      current: page,
      pages: Math.ceil(count / perPage),
      nextPage: hasNextPage ? nextPage : null,
      currentRoute: "/user/banners/",
    });
  },
  getAddBanner: async (req, res) => {
    res.render("admin/banners/addBanner", {
      layout,
    });
  },
  getEditBanner: async (req, res) => {
    const banner = await Banner.findById(req.params.id);
    res.render("admin/banners/editBanner", {
      banner,
      layout,
    });
  },
  addBanner: async (req, res) => {
    console.log(req.body, req.files);
    const banner = new Banner({
      name: req.body.banner_name,
      description: req.body.description,
      reference: req.body.reference,
      image: {
        filename: req.files.banner_image[0].filename,
        originalname: req.files.banner_image[0].originalname,
        path: req.files.banner_image[0].path,
      },
    });
    const create_banner = banner.save();
    if (create_banner) {
      res.json({
        success: true,
      });
    }
  },
  editBanner: async (req, res) => {
    const { name,description, reference, status, imageName } = req.body;
    let edit_banner = {
      name: name,
      description: description,
      reference: reference,
      isActive: status === "true" ? true : false,
    };
    if (req.files) {
      edit_banner.image = {
        filename: req.files.banner_image[0].filename,
        originalname: req.files.banner_image[0].originalname,
        path: req.files.banner_image[0].path,
      };

      //deleting old image from the multer
      fs.unlink(`./public/uploads/banners/${imageName}`, (err) => {
        if (err) throw err;
      });
    }
    // update banner deatails
    const id = req.params.id;
    const update_banner = await Banner.findByIdAndUpdate(
      { _id: id },
      edit_banner,
      { new: true }
    );

    if (update_banner) {
      res.json({
        success: true,
      });
    }
  },
  deleteBanner: async (req, res) => {
    const id = req.query.id;
    const image = req.query.image;
    // delete banner image from file
    fs.unlink(`./public/uploads/banners/${image}`, (err) => {
      if (err) throw err;
    });

    // deleteing banner image from db
    const delete_banner = await Banner.findByIdAndDelete({ _id: id });
    if (delete_banner) {
      res.json({
        success: true,
      });
    }
  },
};
