const adminLayout = "./layouts/adminLayout.ejs";

const User = require("../model/userSchema");
const Product = require("../model/productSchema");
const Orders = require("../model/orderSchema");

module.exports = {
  getDashboard: async (req, res) => {
    const locals = {
      title: "SoleStride - Dashboard",
    };

    // console.log(req.user);
    const users = await User.find();
    const products = await Product.find();

    const usersCount = await User.find().countDocuments();
    const productsCount = await Product.find().countDocuments();

    const confirmedOrders = await Orders.aggregate([
      { $match: { status: "Confirmed" } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
    ]).exec();

    console.log(confirmedOrders);

    const ordersCount = await Orders.find({
      status: "Confirmed",
    }).countDocuments();

    res.render("admin/dashboard", {
      locals,
      users,
      products,
      usersCount,
      ordersCount,
      productsCount,
      totalRevenue: confirmedOrders[0] ? confirmedOrders[0].totalRevenue : 0,
      admin: req.user,
      layout: adminLayout,
    });
  },

  getChartData: async (req, res) => {
    try {
      let timeBaseForSalesChart = req.query.salesChart;
      let timeBaseForOrderNoChart = req.query.orderChart;
      let timeBaseForOrderTypeChart = req.query.orderType;
      let timeBaseForCategoryBasedChart = req.query.categoryChart;

      function getDatesAndQueryData(timeBaseForChart, chartType) {
        let startDate, endDate;

        let groupingQuery, sortQuery;

        if (timeBaseForChart === "yearly") {
          startDate = new Date(new Date().getFullYear(), 0, 1);

          endDate = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999);

          groupingQuery = {
            _id: {
              month: { $month: { $toDate: "$createdAt" } },
              year: { $year: { $toDate: "$createdAt" } },
            },
            totalSales: { $sum: "$totalPrice" },
            totalOrder: { $sum: 1 },
          };

          sortQuery = { "_id.year": 1, "_id.month": 1 };
        }

        if (timeBaseForChart === "weekly") {
          startDate = new Date();

          endDate = new Date();

          const timezoneOffset = startDate.getTimezoneOffset();

          startDate.setDate(startDate.getDate() - 6);

          startDate.setUTCHours(0, 0, 0, 0);

          startDate.setUTCMinutes(startDate.getUTCMinutes() + timezoneOffset);

          endDate.setUTCHours(0, 0, 0, 0);

          endDate.setDate(endDate.getDate() + 1);

          endDate.setUTCMinutes(endDate.getUTCMinutes() + timezoneOffset);

          groupingQuery = {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            totalSales: { $sum: "$totalPrice" },
            totalOrder: { $sum: 1 },
          };

          sortQuery = { _id: 1 };
        }

        if (timeBaseForChart === "daily") {
          startDate = new Date();
          endDate = new Date();

          const timezoneOffset = startDate.getTimezoneOffset();

          startDate.setUTCHours(0, 0, 0, 0);

          endDate.setUTCHours(0, 0, 0, 0);

          endDate.setDate(endDate.getDate() + 1);

          startDate.setUTCMinutes(startDate.getUTCMinutes() + timezoneOffset);

          endDate.setUTCMinutes(endDate.getUTCMinutes() + timezoneOffset);

          groupingQuery = {
            _id: { $hour: "$createdAt" },
            totalSales: { $sum: "$totalPrice" },
            totalOrder: { $sum: 1 },
          };

          sortQuery = { "_id.hour": 1 };
        }

        if (chartType === "sales") {
          return { groupingQuery, sortQuery, startDate, endDate };
        } else if (chartType === "orderType") {
          return { startDate, endDate };
        } else if (chartType === "categoryBasedChart") {
          return { startDate, endDate };
        } else if (chartType === "orderNoChart") {
          return { groupingQuery, sortQuery, startDate, endDate };
        }
      }

      const salesChartInfo = getDatesAndQueryData(
        timeBaseForSalesChart,
        "sales"
      );

      const orderChartInfo = getDatesAndQueryData(
        timeBaseForOrderTypeChart,
        "orderType"
      );

      const categoryBasedChartInfo = getDatesAndQueryData(
        timeBaseForCategoryBasedChart,
        "categoryBasedChart"
      );

      const orderNoChartInfo = getDatesAndQueryData(
        timeBaseForOrderNoChart,
        "orderNoChart"
      );

      let salesChartData = await Orders.aggregate([
        {
          $match: {
            $and: [
              {
                createdAt: {
                  $gte: salesChartInfo.startDate,
                  $lte: salesChartInfo.endDate,
                },
                status: {
                  $nin: ["Cancelled", "Pending", "Failed", "Refunded"],
                },
              },
              {
                paymentStatus: {
                  $nin: ["Pending", "Failed", "Refunded", "Cancelled"],
                },
              },
            ],
          },
        },

        {
          $group: salesChartInfo.groupingQuery,
        },
        {
          $sort: salesChartInfo.sortQuery,
        },
      ]).exec();

      let orderNoChartData = await Orders.aggregate([
        {
          $match: {
            $and: [
              {
                createdAt: {
                  $gte: orderNoChartInfo.startDate,
                  $lte: orderNoChartInfo.endDate,
                },
                status: {
                  $nin: [ "Cancelled", "Failed", "Refunded" ],
                },
              },
              {
                paymentStatus: {
                  $nin: ["Pending", "Failed", "Refunded", "Cancelled"],
                },
              },
            ],
          },
        },

        {
          $group: orderNoChartInfo.groupingQuery,
        },
        {
          $sort: orderNoChartInfo.sortQuery,
        },
      ]).exec();

      let orderChartData = await Orders.aggregate([
        {
          $match: {
            $and: [
              {
                createdAt: {
                  $gte: orderChartInfo.startDate,
                  $lte: orderChartInfo.endDate,
                },
                status: {
                  $nin: ["Failed","Pending", "Cancelled", "Refunded"],
                },
              },
              {
                paymentStatus: {
                  $nin: ["Pending", "Refunded", "Cancelled"],
                },
              },
            ],
          },
        },
        {
          $group: {
            _id: "$paymentMethod",
            totalOrder: { $sum: 1 },
          },
        },
      ]).exec();

      console.log(orderChartData);

      let categoryWiseChartData = await Orders.aggregate([
        {
          $match: {
            $and: [
              {
                createdAt: {
                  $gte: categoryBasedChartInfo.startDate,
                  $lte: categoryBasedChartInfo.endDate,
                },
                status: {
                  $nin: ["clientSideProcessing", "cancelled"],
                },
              },
              {
                paymentStatus: {
                  $nin: ["Pending", "Failed", "Refunded", "Cancelled"],
                },
              },
            ],
          },
        },
        {
          $unwind: "$items",
        },
        {
          $lookup: {
            from: "products",
            localField: "items.product_id",
            foreignField: "_id",
            as: "productInfo",
          },
        },
        {
          $unwind: "$productInfo",
        },
        {
          $replaceRoot: {
            newRoot: "$productInfo",
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "catInfo",
          },
        },
        {
          $addFields: {
            categoryInfo: { $arrayElemAt: ["$catInfo", 0] },
          },
        },
        {
          $project: {
            catInfo: 0,
          },
        },
        {
          $addFields: {
            catName: "$categoryInfo.name",
          },
        },
        {
          $group: {
            _id: "$catName",
            count: { $sum: 1 },
          },
        },
      ]).exec();

      let saleChartInfo = {
        timeBasis: timeBaseForSalesChart,
        data: salesChartData,
      };

      let orderTypeChartInfo = {
        timeBasis: timeBaseForOrderTypeChart,
        data: orderChartData,
      };

      let categoryChartInfo = {
        timeBasis: timeBaseForOrderTypeChart,
        data: categoryWiseChartData,
      };

      let orderQuantityChartInfo = {
        timeBasis: timeBaseForOrderNoChart,
        data: orderNoChartData,
      };

      return res
        .status(200)
        .json({
          saleChartInfo,
          orderTypeChartInfo,
          categoryChartInfo,
          orderQuantityChartInfo,
        });
    } catch (err) {
      // next(err);
      console.log(err);
      return res.status(500).json({ error: "Something went wrong" });
    }
  },

  getUsersList: async (req, res) => {
    const locals = {
      title: "SoleStride - Customers",
    };

    let perPage = 9;
    let page = req.query.page || 1;

    const users = await User.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    const count = await User.countDocuments();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render("admin/users/users", {
      locals,
      users,
      current: page,
      pages: Math.ceil(count / perPage),
      nextPage: hasNextPage ? nextPage : null,
      currentRoute: "/admin/users/",
      layout: adminLayout,
    });
  },

  toggleBlock: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      user.isBlocked = !user.isBlocked;
      await user.save();
      res
        .status(200)
        .json({
          message: user.isBlocked
            ? "User blocked successfully"
            : "User unblocked successfully",
        });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  },
};
