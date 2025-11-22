const ProductCategory = require("../../models/product.category.model");

// [GET] /products-category
module.exports.index = async (req, res) => {
  const productsCategory = await ProductCategory.aggregate([
    {
      $lookup: {
        from: "products",
        localField: "_id",              // _id của ProductCategory
        foreignField: "product_category_id", // ObjectId trong Product
        as: "products",
      },
    },
    {
      $addFields: {
        totalProducts: { $size: "$products" },
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        totalProducts: 1,
        thumbnail: 1,
        slug: 1,
      },
    },
  ]);

  res.json({
    code: 200,
    message: "Danh sách danh mục",
    data: productsCategory,
  });
};
