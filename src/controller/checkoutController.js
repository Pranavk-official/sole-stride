const User = require("../model/userSchema");
const Cart = require("../model/cartSchema");
const Order = require("../model/orderSchema");
const Address = require("../model/addressSchema");
const Product = require("../model/productSchema");
const Payment = require("../model/paymentSchema");
const Wallet = require("../model/walletSchema");
const Coupon = require("../model/couponSchema");

const mongoose = require('mongoose');

// Razorpay
const Razorpay = require("razorpay");
const crypto = require("crypto");


var instance = new Razorpay({
  key_id: process.env.RAZ_KEY_ID,
  key_secret: process.env.RAZ_KEY_SECRET,
});

// Function to check if a product exists and is active
const checkProductExistence = async (cartItem) => {
  const product = await Product.findById(cartItem.product_id);
  if (!product || !product.isActive) {
    throw new Error(`${product.product_name}`);
  }
  return product;
};

// Function to check if the stock is sufficient for a productExistencePromisesproduct
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

async function assignUniqueOrderIDs(items) {
  for (const item of items) {
    let isUnique = false;
    while (!isUnique) {
      const generatedOrderID = generateOrderID();
      const existingOrder = await Order.findOne({
        "items.orderID": generatedOrderID,
      });
      if (!existingOrder) {
        item.orderID = generatedOrderID;
        isUnique = true;
      }
    }
  }
}

let orderCounter = 0;

function generateOrderID() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2); // Last two digits of the year
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month as two digits
  const day = date.getDate().toString().padStart(2, "0"); // Day as two digits

  // Increment and format the counter part
  orderCounter = (orderCounter + 1) % 1000; // Resets every 1000
  const counterPart = orderCounter.toString().padStart(3, "0");

  return `ODR${year}${month}${day}${counterPart}`;
}

// Get Checkout page
// check coupon if valid apply
// Payment and Stuff

const createRazorpayOrder = async (order_id, total) => {
  
  let options = {
    amount: total * 100, // amount in the smallest currency unit
    currency: "INR",
    receipt: order_id.toString(),
  };
  const order = await instance.orders.create(options);
  
  return order;
};

module.exports = {
  getCheckout: async (req, res) => {
    const locals = {
      title: "SoleStride - Checkout",
    };

    if (!req.isAuthenticated()) {
      return res.redirect("/login");
    }

    const userCart = await Cart.findOne({ userId: req.user.id }).populate(
      "items.product_id items.color items.size coupon"
    );
    if (!userCart) {
      return res.redirect("/user/cart");
    }
    if (!userCart.items.length > 0) {
      return res.redirect("/user/cart");
    }

    let user = await User.findById(req.user.id);

    // Correctly use map with async functions
    const productExistencePromises = userCart.items.map((item) =>
      checkProductExistence(item)
    );
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
        `The following items are not available: ${invalidCartItems
          .join(", ")
          .replaceAll("Error:", "")}`
      );

      return res.redirect("/user/cart");
    }

    // Correctly use map with async functions
    const stockAvailabilityPromises = userCart.items.map((item) =>
      checkStockAvailability(item)
    );
    const stockAvailabilityResults = await Promise.allSettled(
      stockAvailabilityPromises
    );

    // Filter out the rejected promises to identify which items have insufficient stock
    const insufficientStockItems = stockAvailabilityResults
      .filter((result) => result.status === "rejected")
      .map((result) => result.reason);

    if (insufficientStockItems.length > 0) {
      console.log(insufficientStockItems);
      req.flash(
        "error",
        `Insufficient stock for the following items: ${insufficientStockItems
          .join(", ")
          .replaceAll("Error: ", "")}`
      );

      return res.redirect("/user/cart");
    }

    const address = await Address.find({
      customer_id: req.user.id,
      delete: false,
    });


    let totalPrice = 0;
    let totalPriceBeforeOffer = 0;
    for (const prod of userCart.items) {
      prod.price = prod.product_id.onOffer
        ? prod.product_id.offerDiscountPrice
        : prod.product_id.sellingPrice;

      const itemTotal = prod.price * prod.quantity;
      prod.itemTotal = itemTotal;
      totalPrice += itemTotal;
      totalPriceBeforeOffer += prod.price;
    }

    // for (let prod of userCart.items) {
    //   prod.price = prod.product_id.sellingPrice * prod.quantity;
    //   totalPrice += prod.price; // Calculate total price
    // }

    // Apply coupon discount if applicable
    let couponDiscount = 0;
    if (userCart.coupon) {
      const coupon = await Coupon.findById(userCart.coupon);
      if (
        coupon &&
        coupon.isActive &&
        new Date() <= coupon.expirationDate &&
        totalPrice >= coupon.minPurchaseAmount
      ) {
        couponDiscount = totalPrice * (coupon.rateOfDiscount / 100);
        totalPrice -= couponDiscount;
      } else {
        // If the total is less than the minimum purchase amount, remove the coupon
        userCart.coupon = undefined;
        userCart.couponDiscount = 0;
        await userCart.save();
      }
    }

    // Update the cart's total price and coupon discount in the database
    // userCart.totalPrice = totalPriceBeforeOffer;
    // userCart.payable = totalPrice;
    // userCart.couponDiscount = couponDiscount;
    // console.log(userCart);
    // await userCart.save();

    // Correctly calculate cartCount
    let cartCount = userCart.items.length;

    const coupons = await Coupon.find({
      isActive: true,
      minPurchaseAmount: { $lte: totalPriceBeforeOffer },
      expirationDate: { $gte: Date.now() },
      // usedBy: [{ $not: req.user.id }],
    });
    // console.log(coupons);

    let userWallet = await Wallet.findOne({ userId: req.user.id });

    if (!userWallet) {
      userWallet = {
        balance: 0,
        transactions: [],
        isInsufficient: true
      }
    }

    let isCOD = true;

    if(totalPrice > 1000){
      isCOD = false;
    }

    if(totalPrice > userWallet.balance){
      userWallet.isInsufficient = true;
    }else{
      userWallet.isInsufficient = false;
    }

    res.render("shop/checkout", {
      locals,
      user,
      address,
      userCart,
      isCOD,
      cartList: userCart.items,
      cartCount,
      coupons,
      totalPrice,
      couponDiscount,
      wallet: userWallet,
      checkout: true,
    });
  },
  placeOrder: async (req, res) => {
    try {
      const { paymentMethod, address } = req.body;

      console.log(req.body);

      let shippingAddress = await Address.findOne({
        _id: address
      })

      shippingAddress = {
        name: shippingAddress.name,
        house_name: shippingAddress.house_name,
        locality: shippingAddress.locality, 
        area_street: shippingAddress.area_street,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        landmark: shippingAddress.landmark,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipcode: shippingAddress.zipcode,
        address: `${shippingAddress.name}, ${shippingAddress.house_name}(H),  ${shippingAddress.locality}, ${shippingAddress.town}, ${shippingAddress.state}, PIN: ${shippingAddress.zipcode}. PH: ${shippingAddress.phone}`
      } 


      if (!req.body.address) {
        return res
          .status(400)
          .json({ status: false, message: "Please add the address" });
      }
      if (!req.body.paymentMethod) {
        return res
          .status(400)
          .json({ status: false, message: "Please select a payment method" });
      }

      const user = await User.findById(req.user.id).catch((error) => {
        console.error(error);
        return res.status(500).json({ error: "Failed to find user" });
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      let userCart = await Cart.findOne({ userId: user._id }).catch((error) => {
        console.error(error);
        return res.status(500).json({ error: "Failed to find user's cart" });
      });

      if (!userCart) {
        return res.status(404).json({ error: "User's cart not found" });
      }
      const status = paymentMethod == "COD" || paymentMethod == "Wallet" ? "Confirmed" : "Pending";

      console.log(userCart.items);

      let order;

      if (userCart.coupon) {
        order = new Order({
          customer_id: user._id,
          items: userCart.items,
          totalPrice: userCart.totalPrice,
          coupon: userCart.coupon,
          couponDiscount: userCart.couponDiscount,
          payable: userCart.payable,
          paymentMethod,
          paymentStatus: status,
          status,
          shippingAddress,
        });

        order.items.forEach((item) => {
          item.status = status;
        });
      } else {
        order = new Order({
          customer_id: user._id,
          items: userCart.items,
          totalPrice: userCart.totalPrice,
          payable: userCart.payable,
          paymentMethod,
          paymentStatus: status,
          status,
          shippingAddress,
        });
      }
      order.items.forEach((item) => {
        item.status = status;
      });
      // order.status = paymentMethod == "COD" ? "Confirmed" : "Pending";
      await assignUniqueOrderIDs(order.items).catch((error) => {
        console.error(error);
        return res
          .status(500)
          .json({ error: "Failed to assign unique order IDs" });
      });

      switch (paymentMethod) {
        case "COD":
          if (!order) {
            return res.status(500).json({ error: "Failed to create order" });
          }

          // Save the order
          const orderPlaced = await order.save();

          if (orderPlaced) {
            // if coupon is used
            if (order.coupon) {
              await Coupon.findOneAndUpdate(
                { _id: userCart.coupon },
                { $push: { usedBy: { userId: req.user.id } } }
              );
            }

            // reduce stock of the variant
            for (const item of userCart.items) {
              const product = await Product.findById(item.product_id).catch(
                (error) => {
                  console.error(error);
                  return res
                    .status(500)
                    .json({ error: "Failed to find product" });
                }
              );

              if (!product) {
                return res.status(404).json({ error: "Product not found" });
              }

              const variantIndex = product.variants.findIndex(
                (variant) => variant._id.toString() === item.variant.toString()
              );

              if (variantIndex === -1) {
                return res.status(404).json({ error: "Variant not found" });
              }

              console.log(product.variants[variantIndex]);

              product.variants[variantIndex].stock -= item.quantity;

              await product.save().catch((error) => {
                console.error(error);
                return res
                  .status(500)
                  .json({ error: "Failed to update product stock" });
              });
            }

            await Cart.clearCart(req.user.id).catch((error) => {
              console.error(error);
              return res
                .status(500)
                .json({ error: "Failed to clear user's cart" });
            });

            return res.status(200).json({
              success: true,
              message: "Order has been placed successfully.",
            });
          }

          break;
        case "Online":
          const createOrder = await Order.create(order);

          let total = parseInt(userCart.payable);
          let order_id = createOrder._id;

          const RazorpayOrder = await createRazorpayOrder(order_id, total).then(
            (order) => order
          );

          const timestamp = RazorpayOrder.created_at;
          const date = new Date(timestamp * 1000); // Convert the Unix timestamp to milliseconds

          // Format the date and time
          const formattedDate = date.toISOString();

          //creating a instance for payment details
          let payment = new Payment({
            payment_id: RazorpayOrder.id,
            amount: parseInt(RazorpayOrder.amount) / 100,
            currency: RazorpayOrder.currency,
            order_id: order_id,
            status: RazorpayOrder.status,
            created_at: formattedDate,
          });

          //saving in to db
          await payment.save();

          return res.json({
            status: true,
            order: RazorpayOrder,
            user,
          });

          break;

        case "Wallet":

          const orderCreate = await Order.create(order);

          if(orderCreate){
            let wallet = await Wallet.findOne({ userId: req.user.id });
            
            wallet.balance = parseInt(wallet.balance) - parseInt(orderCreate.payable);
            
            wallet.transactions.push({
              date: new Date(),
              amount: parseInt(orderCreate.payable),
              message: "Order placed successfully",
              type: "Debit",
            })

            await wallet.save();

            // reduce stock of the variant
            for (const item of userCart.items) {
              const product = await Product.findById(item.product_id).catch(
                (error) => {
                  console.error(error);
                  return res
                    .status(500)
                    .json({ error: "Failed to find product" });
                }
              );

              if (!product) {
                return res.status(404).json({ error: "Product not found" });
              }

              const variantIndex = product.variants.findIndex(
                (variant) => variant._id.toString() === item.variant.toString()
              );

              if (variantIndex === -1) {
                return res.status(404).json({ error: "Variant not found" });
              }

              console.log(product.variants[variantIndex]);

              product.variants[variantIndex].stock -= item.quantity;

              await product.save().catch((error) => {
                console.error(error);
                return res
                  .status(500)
                  .json({ error: "Failed to update product stock" });
              });
            }

            await Cart.clearCart(req.user.id);

            orderCreate.status = "Confirmed";
            orderCreate.items.forEach((item) => {
              item.status = "Confirmed";
            });

            await orderCreate.save();


            return res.status(200).json({
              success: true,
              message: "Order has been placed successfully.",
            });
          }

          break;
          
        default:
          return res.status(400).json({ error: "Invalid payment method" });
      }

    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while placing the order" });
    }
  },

  verifyPayment: async (req, res) => {
    try {
      const secret = process.env.RAZ_KEY_SECRET;

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        req.body.response;
      console.log("payment verification: ", req.body, secret);
      let hmac = crypto.createHmac("sha256", secret);
      hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
      hmac = hmac.digest("hex");
      const isSignatureValid = hmac === razorpay_signature;

      console.log(isSignatureValid);

      if (isSignatureValid) {
        let customer_id = req.user.id;

        let userCart = await Cart.findOne({ userId: customer_id }).catch(
          (error) => {
            console.error(error);
            return res
              .status(500)
              .json({ error: "Failed to find user's cart" });
          }
        );

        // reduce stock of the variant
        for (const item of userCart.items) {
          const product = await Product.findById(item.product_id).catch(
            (error) => {
              console.error(error);
              return res.status(500).json({ error: "Failed to find product" });
            }
          );

          if (!product) {
            return res.status(404).json({ error: "Product not found" });
          }

          const variantIndex = product.variants.findIndex(
            (variant) => variant._id.toString() === item.variant.toString()
          );

          if (variantIndex === -1) {
            return res.status(404).json({ error: "Variant not found" });
          }

          console.log(product.variants[variantIndex]);

          product.variants[variantIndex].stock -= item.quantity;

          await product.save().catch((error) => {
            console.error(error);
            return res
              .status(500)
              .json({ error: "Failed to update product stock" });
          });
        }

        //empty the cart
        await Cart.clearCart(req.user.id).catch((error) => {
          console.error(error);
          return res.status(500).json({ error: "Failed to clear user's cart" });
        });

        let paymentId = razorpay_order_id;

        const orderID = await Payment.findOne(
          { payment_id: paymentId },
          { _id: 0, order_id: 1 }
        );

        const order_id = orderID.order_id;

        const updateOrder = await Order.updateOne(
          { _id: order_id },
          { $set: { "items.$[].status": "Confirmed", "items.$[].paymentStatus": "Paid" , status: "Confirmed", paymentStatus: "Paid" } }
        );

        let couponId = await Order.findOne({ _id: order_id }).populate(
          "coupon"
        );

        console.log(couponId);
        if (couponId.coupon) {
          couponId = couponId.coupon._id;
          if (couponId) {
            let updateCoupon = await Coupon.findByIdAndUpdate(
              { _id: new mongoose.Types.ObjectId(couponId) },
              {
                $push: { usedBy: customer_id },
              },
              {
                new: true,
              }
            );
          }
        }
        req.session.order = {
          status: true,
        };
        res.json({
          success: true,
        });
      } else {
       
      }
    } catch (error) {
      console.log(error);
    }
  },
  orderConfirmation: async (req, res) => {},
  orderErrors: async (req, res) => {},
};
