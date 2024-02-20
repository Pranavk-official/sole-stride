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

    const address = await Address.findOne({ _id: req.body.address });

    if (address && cartList) {
      let items = [];

      for (let i = 0; i < cartList.length; i++) {
        items.push({
          product_id: cartList[i].cart.product_id,
          quantity: cartList[i].cart.quantity,
          price: parseInt(cartList[i].prod_detail.sellingPrice),
        });
      }

      let totalPrice = 0;
      for (let prod of cartList) {
        prod.price = prod.prod_detail.sellingPrice * prod.cart.quantity;
        totalPrice += prod.price;
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
    // const order = await Order.find({ customer_id: user._id });
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);


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
  cancelOrder: async (req, res) => {
    try {
      console.log(req.params);

      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({ message: "Order not found." });
      }

      if (order.status === "Cancelled") {
        return res.status(400).json({ message: "Order is already cancelled." });
      }

      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        {
          $set: { status: "Cancelled", cancelled_on: new Date() },
        },
        { new: true }
      ); // Use the { new: true } option to return the updated document

      if (!updatedOrder) {
        return res.status(500).json({ message: "Failed to cancel order." });
      }

      // Assuming you have a Product model and each product has a quantity field
      for (const item of updatedOrder.items) {
        const product = await Product.findById(item.product_id);
        if (product) {
          product.stock += item.quantity; // Increment the quantity of the product
          await product.save(); // Save the updated product
        }
      }

      res
        .status(200)
        .json({
          message: "Order cancelled successfully.",
          order: updatedOrder,
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error." });
    }
  },
  returnOrder: async (req, res) => {},

  /**
   * Admin Side
   */

  getOrders: async (req, res) => {
    const locals = {
      title: "Order Management",
    };

    let perPage = 10;
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
    ]).skip(perPage * page - perPage)
    .limit(perPage)
    .exec();

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
    const orderDetails = await Order.findOne({ _id: req.params.id })
      .populate("customer_id")
      .populate("items.product_id");

    console.log(orderDetails.customer_id);
    res.render("admin/orders/viewOrder", {
      layout,
      orderDetails,
    });
  },

  changeOrderStatus: async (req, res) => {
    const status = req.body.status;
    const order_id = req.params.id;
  
    try {
      // Check if the order exists
      const order = await Order.findById(order_id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }
  
      // Check if the new status is valid
      if (!['Cancelled', 'Pending', 'confirmed', 'Shipped', 'Out for Delivery', 'Delivered'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status.' });
      }
  
      // Update the order status
      const updateOrder = await Order.updateOne(
        { _id: order_id },
        { $set: { status: status } }
      );
  
      // Check if the order was successfully updated
      if (updateOrder) {
        res.json({ success: true, message: 'Order status updated successfully.' });
      } else {
        res.status(400).json({ success: false, message: 'No changes were made.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error.' });
    }
  },
};
