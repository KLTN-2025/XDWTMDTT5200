const cartRoute = require("./cart.route");
const productRoute = require("./product.route");
const searchRoute = require("./search.route");
const homeRoute = require("./home.route");
const userRoute = require("./user.route");
const checkoutRoute = require("./checkout.route");
const settingRoute = require("./setting-general.route");
const articleRoute = require("./article.route");
const productCategoryRoute = require("./product-category.route");
const chatAi = require("./chatai.route");
const vnPay = require("./vn-pay.route");
const momoPay = require("./momo-pay.route");
const bunz = require("./bunz.route");
const banner = require("./banner.route");
const voucher = require("./vouchers.route");
const brand = require("./brand.route");
const campaign = require("./campaign.route");
const contact = require("./contact.route");

const connectDb = require("../../middlewares/connectMongo.middware");

module.exports = (app) => {
  app.use(connectDb.connectMongo);

  app.use(`/api/v1/vn-pay`, vnPay);
  app.use(`/api/v1/momo-pay`, momoPay);
  app.use(`/api/v1/bunz`, bunz);

  app.use(`/api/v1/banners`, banner);
  app.use(`/api/v1/cart`, cartRoute);
  app.use(`/api/v1/products`, productRoute);
  app.use(`/api/v1/search`, searchRoute);
  app.use(`/api/v1`, homeRoute);
  app.use(`/api/v1/users`, userRoute);
  app.use(`/api/v1/checkout`, checkoutRoute);
  app.use(`/api/v1/settings`, settingRoute);
  app.use(`/api/v1/articles`, articleRoute);
  app.use(`/api/v1/products-category`, productCategoryRoute);
  app.use(`/api/v1/chatbot`, chatAi);
  app.use(`/api/v1/vouchers`, voucher);
  app.use(`/api/v1/brands`, brand);
  app.use(`/api/v1/campaigns`, campaign);
  app.use(`/api/v1/contacts`, contact);
};
