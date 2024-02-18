const Order = require("../model/orderSchema");
const User = require("../model/userSchema");
const Product = require("../model/productSchema");
const Address = require("../model/addressSchema");

const layout = "./layouts/adminLayout.ejs";

module.exports = {
  /**
   * User Side
   */
  // user place order
  placeOrder: async (req, res) => {
    if (!req.body.address) {
      return res.json({ status: false, message: "Please add the address" });
    }

    console.log(req.body);
    const user = await User.findById(req.user.id);
    let status;
    if (
      req.body.paymentMethod === "COD" ||
      req.body.paymentMethod === "wallet"
    ) {
      status = "confirmed";
    } else {
      status = "pending";
    }

    let cartList = await User.aggregate([
      { $match: { _id: user._id } },
      { $project: { cart: 1, _id: 0 } },
      { $unwind: { path: "$cart" } },
      {
        $lookup: {
          from: "products",
          localField: "cart.product_id",
          foreignField: "_id",
          as: "prod_detail",
        },
      },
      { $unwind: { path: "$prod_detail" } },
      {
        $project: {
          prod_detail_id: 1,
          "prod_detail.sellingPrice": 1,
          cart: 1,
        },
      },
    ]);

    console.log(cartList);
    const address = await Address.findOne({ _id: req.body.address });

    if (address && cartList) {
      let items = [];

      for (let i = 0; i < cartList.length; i++) {
        items.push({
          product_id: cartList[i].cart.product_id,
          quantity: cartList[i].cart.quantity,
          price: parseInt(cartList[i].prod_detail.sellingPrice),
          status: status,
        });
      }

      let totalPrice = 0;
      for (let prod of cartList) {
        prod.price = prod.prod_detail.sellingPrice * prod.cart.quantity;
        totalPrice += prod.price; // Calculate total price
      }

      let order = {
        customer_id: user._id,
        items: items,
        address: address,
        payment_method: req.body.paymentMethod,
        total_amount: totalPrice,
        status: status,
      };

      if (req.body.paymentMethod === "COD") {
        const createOrder = await Order.create(order);
        if (createOrder) {
          //empty the cart
          await User.updateOne({ _id: user._id }, { $unset: { cart: "" } });

          //reduce the stock count
          for (let i = 0; i < items.length; i++) {
            await Product.updateOne(
              { _id: items[i].product_id },
              { $inc: { stock: -items[i].quantity } }
            );
          }
          req.session.order = {
            status: true,
          };
          res.json({
            success: true,
          });
        }
      }
    }
  },
  // Order view
  getUserOrders: async (req, res) => {
    let user = await User.findById(req.user.id);

    let perPage = 6;
    let page = req.query.page || 1;

    let orderDetails = await Order.aggregate([
      {
        $match: {
          customer_id: user._id,
        },
      },
      {
        $project: {
          _id: 1,
          items: 1,
          address: 1,
          payment_method: 1,
          status: 1,
          createdAt: 1,
          total_amount: 1,
        },
      },
    ])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    orderDetails = orderDetails.reverse();

    const count = await Order.countDocuments({ customer_id: user._id });
    const order = await Order.find({ customer_id: user._id });
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    console.log(orderDetails.items);

    res.render("user/orders", {
      orderDetails,
      current: page,
      pages: Math.ceil(count / perPage),
      nextPage: hasNextPage ? nextPage : null,
      currentRoute: "/user/orders/",
    });
  },
  getUserOrder: async (req, res) => {
    const locals = {
      title: "SoloStride - Orders",
    };
    const orderDetails = await Order.find({ _id: req.params.id }).populate(
      "items.product_id"
    );

    orderDetails[0].items.forEach((item) => {
      console.log(item);
    });

    res.render("user/orderDetail", {
      locals,
      user: req.user,
      orderDetails,
      orderDetail: orderDetails[0],
      orderProducts: orderDetails[0].items,
      address: orderDetails[0].address,
    });
  },
  // Cancel and Return
  cancelOrder: async (req, res) => {},
  returnOrder: async (req, res) => {},

  /**
   * Admin Side
   */

  getOrders: async (req, res) => {
    const locals = {
      title: "Order Management",
    };

    let perPage = 9;
    let page = req.query.page || 1;

    const orders = await Order.aggregate([
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "customer_id",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: {
          path: "$customer",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "items.product_id",
          foreignField: "_id",
          as: "item.product",
        },
      },
    ]);

    // console.log(orders);
    const count = await Order.countDocuments();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render("admin/orders/orders", {
      locals,
      orders,
      current: page,
      pages: Math.ceil(count / perPage),
      nextPage: hasNextPage ? nextPage : null,
      currentRoute: "/admin/orders/",
      layout,
    });
  },
  getOrderDetails: async (req, res) => {
    res.render('admin/orders/viewOrder',{
      layout
    })
  },

  changeOrderStatus: async (req, res) => {},
};
