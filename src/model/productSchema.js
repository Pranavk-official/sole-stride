const mongoose = require("mongoose");
const { Schema, ObjectId } = mongoose;

const marked = require('marked');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');


const dompurify = createDOMPurify(new JSDOM().window);


const productSchema = new Schema(
  {
    product_name: {
      type: String,
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    markdown1: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    markdown2: {
      type: String,
      required: true,
    },
    primary_image: {
      name: {
        type: String,
      },
      path: {
        type: String,
      },
    },
    secondary_images: [
      {
        name: {
          type: String,
        },
        path: {
          type: String,
        },
      },
    ],
    variants: [
      {
        color: {
          type: ObjectId, // Reference to Color object ID
          ref: "Color", // Reference to the 'Color' model
          required: true,
        },
        size: {
          type: ObjectId, // Reference to Size object ID
          ref: "Size", // Reference to the 'Size' model
          required: true,
        },
        stock: {
          type: Number,
          required: true,
        },
      },
    ],
    reviews: [
      {
        user: {
          user_id: {
            type: ObjectId,
            ref: "User",
          },
          name: {
            type: String,
          },
          email: {
            type: String,
          },
        },

        rating: {
          type: Number,
        },
        comment: {
          type: String,
        },

        product: {
          id: {
            type: ObjectId,
            ref: "Product",
          },
          name: {
            type: String,
          },
          color: {
            type: String,
          },
          size: {
            type: Number,
          },
        },

        date: {
          type: Date,
          default: Date.now,
        }
      },
    ],
    price: {
      type: Number,
    },
    actualPrice: {
      type: Number,
      required: true,
    },
    sellingPrice: {
      type: Number,
      required: true,
    },
    onOffer: {
      type: Boolean,
      default: false,
    },
    offerDiscountPrice: {
      type: Number,
      min: 0,
      default: 0
    },
    offerDiscountRate: {
      type: Number,
      min: 0,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);


productSchema.pre("validate", async function (next) {
  console.log("markdown1", this.markdown1);
  if(this.markdown1) {
    this.description = dompurify.sanitize(marked.parse(this.markdown1));
  }

  if(this.markdown2) {
    this.details = dompurify.sanitize(marked.parse(this.markdown2));
  }

  next();
});



module.exports = mongoose.model("Product", productSchema);
