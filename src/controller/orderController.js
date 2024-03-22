const Order = require("../model/orderSchema");
const User = require("../model/userSchema");
const Product = require("../model/productSchema");
const Address = require("../model/addressSchema");
const Wallet = require("../model/walletSchema");
const Return = require("../model/returnSchema");
const mongoose = require("mongoose");

const layout = "./layouts/adminLayout.ejs";

module.exports = {
  /**
   * User Side
   */

  // Order view
  getUserOrders: async (req, res) => {
    let user = await User.findById(req.user.id);

    let perPage = 4;
    let page = req.query.page || 1;

    let orderDetails = await Order.find({ customer_id: user._id })
      .populate(
        "customer_id items.product_id items.color items.size shippingAddress coupon"
      )
      .sort({ createdAt: -1 })
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    // orderDetails = orderDetails.reverse();
    console.log(orderDetails[0]);

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
  getSingleOrder: async (req, res) => {
    const { orderId } = req.params;

    try {
      let order_id = new mongoose.Types.ObjectId(orderId);
      let orderDetails = await Order.aggregate([
        {
          $match: {
            _id: order_id,
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
            as: "products",
          },
        },
        {
          $lookup: {
            from: "colors", // Assuming 'colors' is the collection name for colors
            localField: "items.color",
            foreignField: "_id",
            as: "items.colorDetails",
          },
        },
        {
          $lookup: {
            from: "sizes", // Assuming 'sizes' is the collection name for sizes
            localField: "items.size",
            foreignField: "_id",
            as: "items.sizeDetails",
          },
        },
        {
          $unwind: "$products",
        },

        {
          $addFields: {
            variant: {
              $mergeObjects: [
                { $arrayElemAt: ["$items.colorDetails", 0] },
                { $arrayElemAt: ["$items.sizeDetails", 0] },
              ],
            },
          },
        },
        {
          $project: {
            "items.colorDetails": 0,
            "items.sizeDetails": 0,
          },
        },
      ]);

      // Loop through the array and format the dates
      for (const order of orderDetails) {
        switch (order.items.status) {
          case "Confirmed":
            order.items.track = 15;
            order.items.ordered = true;
            order.items.delivered = false;
            order.items.cancelled = false;
            order.items.shipped = false;
            order.items.outdelivery = false;
            order.items.return = false;
            order.items.inReturn = false;
            order.items.needHelp = true;
            break;
          case "Shipped":
            order.items.track = 38;
            order.items.ordered = true;
            order.items.delivered = false;
            order.items.cancelled = false;
            order.items.shipped = true;
            order.items.outdelivery = false;
            order.items.return = false;
            order.items.inReturn = false;
            order.items.needHelp = true;
            break;
          case "Out for Delivery":
            order.items.track = 65;
            order.items.ordered = true;
            order.items.delivered = false;
            order.items.cancelled = false;
            order.items.shipped = true;
            order.items.outdelivery = true;
            order.items.return = false;
            order.items.inReturn = false;
            order.items.needHelp = true;
            break;
          case "Delivered":
            order.items.track = 100;
            order.items.ordered = false;
            order.items.cancelled = false;
            order.items.shipped = true;
            order.items.delivered = true;
            order.items.outdelivery = true;
            order.items.return = true;
            order.items.inReturn = false;
            order.items.needHelp = false;
            break;
          case "Cancelled":
            order.items.track = 0;
            order.items.ordered = false;
            order.items.cancelled = true;
            order.items.delivered = false;
            order.items.shipped = false;
            order.items.outdelivery = false;
            order.items.return = false;
            order.items.inReturn = false;
            order.items.needHelp = true;
            break;
          default:
            order.items.track = 0;
            order.items.pending = true;
            order.items.inReturn = false;
        }
      }

      const isInReturn = await Return.findOne({ order_id: order_id });
      if (isInReturn) {
        for (const order of orderDetails) {
          const orderProductId = (await order.items.product_id).toString();
          const orderItemId = (await order.items.orderID).toString();
          const returnProductId = (isInReturn.product_id).toString();
          const returnItemId = (isInReturn.item_id).toString();

          if (orderProductId === returnProductId && orderItemId === returnItemId) {
            order.items.inReturn = true;
            order.items.return = false;
            order.items.needHelp = false;
            order.items.status = isInReturn.status;
          }
        }
      }

      // console.log(orderDetails);
      res.render("user/order", {
        orderDetails,
      });
    } catch (error) {
      console.log(error);
    }
  },
  // Cancel and Return
  cancelOrder: async (req, res) => {
    try {
      console.log(req.params);
      const { id, itemId, variant } = req.params;

      let pvar = variant.toString();

      const order = await Order.findOne({ _id: id, "items.orderID": itemId });

      console.log(order);

      if (!order) {
        return res.status(404).json({ message: "Order not found." });
      }

      const updatedOrder = await Order.updateOne(
        { _id: id, "items.orderID": itemId },
        {
          $set: {
            "items.$.status": "Cancelled",
            "items.$.cancelled_on": new Date(),
          },
        },
        { new: true }
      ); // Use the { new: true } option to return the updated document

      console.log(updatedOrder);
      if (!updatedOrder) {
        return res.status(500).json({ message: "Failed to cancel order." });
      }

      // If payment is done using wallet or online add the amount back to the user's wallet


      if (order.paymentMethod === "Wallet" || order.paymentMethod === "Online") {
        let price = await Order.aggregate([
          {
            $match: {
              _id: new mongoose.Types.ObjectId(id),
              "items.orderID": itemId,
            }
          },
          {
            $unwind: "$items"
          },
          {
            $match: {
              "items.orderID": itemId
            },

          },
          {
            $project: {
              _id: 0,
              itemTotal: "$items.itemTotal"
            }
          }
        ])


        console.log(price);

        const wallet = await Wallet.findOne({ userId: req.user.id });

        wallet.balance = parseInt(wallet.balance) + parseInt(price[0].itemTotal);

        wallet.transactions.push({
          date: new Date(),
          amount: parseInt(price[0].itemTotal),
          message: "Order cancelled successfully",
          type: "Credit",
        })

        await wallet.save();

      }

      const updateOrder = await Order.findOne({
        _id: id,
        "items.orderID": itemId,
      });
      // console.log(updateOrder, variant);
      // Assuming you have a Product model and each product has a quantity field
      for (const item of updateOrder.items) {
        const product = await Product.findById(item.product_id);
        if (product) {
          const variantIndex = product.variants.findIndex(
            (variant) => variant._id.toString() === pvar
          );

          if (variantIndex === -1) {
            return res.status(404).json({ error: "Variant not found" });
          }

          console.log(product.variants[variantIndex]);

          product.variants[variantIndex].stock += item.quantity;

          // product.stock += item.quantity; // Increment the quantity of the product
          await product.save(); // Save the updated product
        }
      }

      res.status(200).json({
        message: "Order cancelled successfully.",
        order: updatedOrder,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error." });
    }
  },
  cancelAllOrders: async (req, res) => {
    try {
      const { orderId } = req.params;

      const updatedOrder = await Order.updateOne(
        { _id: orderId },
        {
          $set: {
            status: "Cancelled",
            "items.$.status": "Cancelled",
            "items.$[elem].cancelled_on": new Date(),
          },
        },

        {
          arrayFilters: [{ "elem.status": { $ne: "cancelled" } }],
        },
        { new: true }
      );

      if (updatedOrder) {


        const updateOrder = await Order.findOne({ _id: orderId });
        for (const item of updateOrder.items) {
          const product = await Product.findById(item.product_id);
          if (product) {
            const variantIndex = product.variants.findIndex(
              (variant) => variant._id.toString() === item.variant.toString()
            );

            if (variantIndex === -1) {
              return res.status(404).json({ error: "Variant not found" });
            }

            console.log(product.variants[variantIndex]);

            product.variants[variantIndex].stock += item.quantity;

            // product.stock += item.quantity; // Increment the quantity of the product
            await product.save(); // Save the updated product
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  },
  returnOrder: async (req, res) => {
    console.log(req.body);
    let retrn = new Return({
      user_id: req.user.id,
      order_id: req.body.order_id,
      product_id: req.body.product_id,
      variant: req.body.variant,
      item_id: req.body.item_id,
      reason: req.body.reason,
      status: "pending",
      comment: req.body.comment,
    });
    retrn.save().then((retrn) => {
      console.log("Return request saved:", retrn);
    });
    res.json({
      success: true,
    });
  },

  /**
   * Admin Side
   */

  getOrders: async (req, res) => {
    // Product Wise Orders
    const locals = {
      title: "Order Management",
    };

    let perPage = 10;
    let page = req.query.page || 1;

    let orderDetails = await Order.aggregate([
      {
        $project: {
          _id: 1,
          customer_id: 1,
          items: 1,
          shippingAddress: 1,
          paymentMethod: 1,
          totalPrice: 1,
          coupon: 1,
          couponDiscount: 1,
          payable: 1,
          categoryDiscount: 1,
          paymentStatus: 1,
          orderStatus: 1,
          clientOrderProcessingCompleted: 1,
          createdAt: 1,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "customer_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$items" } },
      {
        $lookup: {
          from: "products",
          localField: "items.product_id",
          foreignField: "_id",
          as: "product_detail",
        },
      },
      {
        $lookup: {
          from: "colors",
          localField: "items.color",
          foreignField: "_id",
          as: "product_color",
        },
      },
      {
        $lookup: {
          from: "sizes",
          localField: "items.size",
          foreignField: "_id",
          as: "product_size",
        },
      },
      {
        $addFields: {
          productDetails: {
            $mergeObjects: [
              {
                $arrayElemAt: ["$product_detail", 0],
              },
              {
                $arrayElemAt: ["$product_color", 0],
              },
              { $arrayElemAt: ["$product_size", 0] },
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          user: 1,
          items: 1,
          paymentMethod: 1,
          totalPrice: 1,
          coupon: 1,
          couponDiscount: 1,
          payable: 1,
          paymentStatus: 1,
          orderStatus: 1,
          createdAt: 1,
          productDetails: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: perPage * page - perPage },
      { $limit: perPage },
    ]);

    // console.log(orderDetails, orderDetails.length);

    // console.log(orders);
    const count = await Order.countDocuments();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render("admin/orders/orders", {
      locals,
      orders: orderDetails,
      current: page,
      pages: Math.ceil(count / perPage),
      nextPage: hasNextPage ? nextPage : null,
      currentRoute: "/admin/orders/",
      layout,
    });
  },
  getOrdersOld: async (req, res) => {
    // Product Wise Orders
    const locals = {
      title: "Order Management",
    };

    let perPage = 10;
    let page = req.query.page || 1;

    const orders = await Order.find()
      .populate("customer_id items.product_id items.color items.size coupon")
      .skip(perPage * page - perPage)
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
    const orderId = req.params.id;
    const { productId, variant } = req.query;

    try {
      const orderDetails = await Order.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(orderId) } }, // Filter by order ID
        { $unwind: "$items" }, // Unwind items array to process each item individually
        {
          $match: {
            "items.product_id": new mongoose.Types.ObjectId(productId), // Filter items by product ID
            "items.variant": new mongoose.Types.ObjectId(variant), // Filter items by variant
          },
        },
        {
          $lookup: {
            from: "products", // Assuming 'products' is the collection name for products
            localField: "items.product_id",
            foreignField: "_id",
            as: "items.productDetails",
          },
        },
        {
          $lookup: {
            from: "colors", // Assuming 'colors' is the collection name for colors
            localField: "items.color",
            foreignField: "_id",
            as: "items.colorDetails",
          },
        },
        {
          $lookup: {
            from: "sizes", // Assuming 'sizes' is the collection name for sizes
            localField: "items.size",
            foreignField: "_id",
            as: "items.sizeDetails",
          },
        },
        {
          $lookup: {
            from: "users", // Assuming 'sizes' is the collection name for sizes
            localField: "customer_id",
            foreignField: "_id",
            as: "userDetail",
          },
        },
        {
          $lookup: {
            from: "addresses", // Assuming 'sizes' is the collection name for sizes
            localField: "shippingAddress",
            foreignField: "_id",
            as: "addressDetails",
          },
        },
        {
          $addFields: {
            productDetails: {
              $mergeObjects: [
                { $arrayElemAt: ["$items.productDetails", 0] },
                { $arrayElemAt: ["$items.colorDetails", 0] },
                { $arrayElemAt: ["$items.sizeDetails", 0] },
              ],
            },
            user: { $arrayElemAt: ["$userDetail", 0] },
            address: { $arrayElemAt: ["$addressDetails", 0] },
          },
        },
        {
          $project: {
            userDetail: 0,
            addressDetails: 0,
            "items.productDetails": 0,
            "items.colorDetails": 0,
            "items.sizeDetails": 0,
          },
        },
      ]);

      // console.log(orderDetails);

      // console.log(orderDetails.customer_id);
      res.render("admin/orders/viewOrder", {
        layout,
        orderDetails: orderDetails[0],
      });
    } catch (error) {
      console.log(error);
    }
  },

  changeOrderStatus: async (req, res) => {
    const order_id = req.params.id;

    const { productId, variant, status } = req.body;

    console.log(req.body);
    try {
      // Check if the order exists
      const order = await Order.findById(order_id);
      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found." });
      }

      // Check if the new status is valid
      if (
        ![
          "Cancelled",
          "Pending",
          "Confirmed",
          "Shipped",
          "Out for Delivery",
          "Delivered",
        ].includes(status)
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid status." });
      }

      // Prepare the update object based on the new status
      let update = { "items.$.status": status };
      if (status === "Shipped") {
        update.shipped_on = new Date();
      } else if (status === "Out for Delivery") {
        update.out_for_delivery = new Date();
      } else if (status === "Delivered") {
        update.delivered_on = new Date();
      }

      // Update the order status
      const updateOrder = await Order.updateOne(
        {
          _id: order_id,
          "items.product_id": productId,
          "items.variant": variant,
        },
        { $set: update }
      );

      console.log(updateOrder);
      // Check if the order was successfully updated
      if (updateOrder.modifiedCount > 0) {
        req.flash("success", "Product Order Status Updated Successfully");
        res.redirect("/admin/orders");
      } else {
        req.flash("error", "No changes were made.");
        res.redirect("/admin/orders");
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error." });
    }
  },
};
