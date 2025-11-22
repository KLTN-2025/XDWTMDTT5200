const Brand = require("../../models/brands.model");

// [GET] /brands
module.exports.index = async (req, res) => {
  try {
    const brands = await Brand.find({
      deleted: false
    }).lean()
    .select("title _id logo thumbnail slug");

    res.json({
      code: 200,
      message: "Lấy danh sách thành công",
      data: brands
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Lỗi " + error.message
    });
  }

} 