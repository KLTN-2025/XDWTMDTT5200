const Product = require("../../models/product.model");
const Brand = require("../../models/brands.model");
const ShippingSetting = require("../../models/shippingSetting.model");
const Voucher = require("../../models/voucher.model");
const ProductCategory = require("../../models/product.category.model");
const productsHelper = require("../../../../helpers/products");

module.exports.home = async (req, res) => {
  const products = await Product.find({
    deleted: false,
    status: "active",
    featured: "1",
  })
    .select(
      `-updatedBy -createdAt -updatedAt -createBy -deleted 
      -deletedAt -sizeStock -outfitSuggestions -productSizeChart -additionalInformation -excerpt`
    )
    .populate("product_category_id", "title")
    .populate("brand_id", "title")
    .lean();

  const productCategory = await ProductCategory.find({
    deleted: false,
    status: "active",
  });

  const featuredProducts = productsHelper.priceNewProducts(products);

  const productsNew = productsHelper.priceNewProducts(
    await Product.find({
      deleted: false,
      status: "active",
    })
      .sort({ createdAt: -1 })
      .select("title slug sold thumbnail")
      .lean()
      .limit(20)
  );

  const bestSellingProducts = productsHelper.priceNewProducts(
    await Product.find({
      deleted: false,
      status: "active",
    })
      .sort({ sold: "desc" })
      .select("title slug sold thumbnail")
      .lean()
      .limit(10)
  );

  const brands = await Brand.find({
    deleted: false,
    status: "active",
  }).sort({ position: "asc" })
    .select("_id title slug thumbnail")
    .lean();

  const vouchers = await Voucher.find({
    deleted: false,
    status: "active"
  })
    .sort({ createdAt: -1 })
    .select("_id voucher_code discount_value min_order_value max_order_value code")
    .limit(4)
    .lean()


  const shippingFee = await ShippingSetting.findOne().lean();
  res.json({
    code: 200,
    message: "Trang chủ",
    data: {
      featuredProducts,
      productsNew,
      productCategory,
      bestSellingProducts,
      brands,
      vouchers,
      shippingFee
    },
  });
};
