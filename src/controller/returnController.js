const User = require("../model/userSchema");
const Returns = require("../model/returnSchema");
const Order = require("../model/orderSchema");

const layout = "./layouts/adminLayout";

module.exports = {
  getReturnRequests: async (req, res) => {
    const returns = await Returns.find({}).populate("order_id user_id product_id variant");

    for (let request of returns) {
      if (request.status !== "pending") {
        request.return = true;
      } else {
        request.return = false;
      }
    }

    console.log(returns);

    res.render("admin/returns", {
      returns,
      layout,
    });
  },

  approveReturn: async (req, res) => {
    const { id } = req.params;

    try {
      const returnRequest = await Returns.findByIdAndUpdate(
        id,
        { status: "approved" },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Return request approved",
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to approve return request" });
    }
  },
  declineReturn: async (req, res) => {
    const { id } = req.params;

    try {
      const returnRequest = await Returns.findByIdAndUpdate(id, {
        status: "declined",
      });

      return res.status(200).json({
        success: true,
        message: "Return request declined",
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to decline return request" });
    }
  },
};
