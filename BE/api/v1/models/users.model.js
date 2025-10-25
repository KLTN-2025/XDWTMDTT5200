const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  google_id: {
    type: String,
    default: ""
  },
  facebook_id: {
    type: String,
    default: ""
  },
  fullName: String,
  email: String,
  password: String,
  rank: String,
  phone: {
    type: String,
    default: ""
  },
  points: {
    type: Number,
    default: 0, // tổng điểm hiện có
  },
  isAuthAccount: Boolean, // false: chưa có mật khẩu nội bộ
  provider: String,
  avatar: {
    type: String,
    default: ""
  },
  address: {
    type: String,
    default: ""
  },
  favorites: [
    {
      product_id: String
    }
  ],
  status: {
    type: String,
    default: "active"
  },
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
},
  {
    timestamps: true,
  });

const User = mongoose.model('User', userSchema, "users");

module.exports = User;