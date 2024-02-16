const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: ' '
    },
    image: {
        filename: String,
        originalname: String,
        path: String,
    },
    reference: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        required: true,
        default:true
    }
},
{
    timestamps: true,
}
);

module.exports = mongoose.model("Banner", bannerSchema);
