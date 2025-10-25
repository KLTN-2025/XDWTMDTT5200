const mongoose = require("mongoose");
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);


const productCategorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  thumbnail: String,
  parent_id: {
    type: String,
    default: ""
  },
  status: String,
  position: Number,
  slug: { type: String, slug: "title", unique: true },
  createBy: {
    user_Id: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  deletedBy: {
    user_Id: String,
    deletedAt: Date,
  },
  updatedBy: [
    {
      user_Id: String,
      updatedAt: Date,
    },
  ],
  deleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: Date,
},
  {
    timestamps: true,
  });

const ProductCategory = mongoose.model('ProductCategory', productCategorySchema, "products-categorys");

module.exports = ProductCategory; 