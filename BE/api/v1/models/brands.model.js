const mongoose = require("mongoose");
const slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

const brandSchema = new mongoose.Schema({
  title: { type: String, required: true },
  excerpt: String,
  description: String,
  thumbnail: String,
  logo: String,
  featured: String,
  status: String,
  position: Number,
  slug: { type: String, slug: "title", unique: true },
  deleted: {
    type: Boolean,
    default: false
  },
  createBy: {
    user_Id: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  deletedBy: {
    user_Id: String,
    deletedAt: Date
  },
  updatedBy: [
    {
      user_Id: String,
      updatedAt: Date
    }
  ],
  deletedAt: Date
},
  {
    timestamps: true,
  }
);

const Brand = mongoose.model('Brand', brandSchema, "brands");

module.exports = Brand; 