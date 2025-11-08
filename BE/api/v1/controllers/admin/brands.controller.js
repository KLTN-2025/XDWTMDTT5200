const Product = require("../../models/product.model");
const Review = require("../../models/review.model");
const ProductCategory = require("../../models/product.category.model");
const Brand = require("../../models/brands.model");
const panigationHelper = require("../../../../helpers/pagination");
const searchHelper = require("../../../../helpers/search");

// [GET] /api/v1/brands
module.exports.index = async (req, res) => {
  try {
    const { status, limit, page, keyword, sortKey, sortType } = req.query;

    // Bộ lọc mặc định
    let find = { deleted: false };
    if (status) find.status = status;

    // Phân trang
    const limitItems = parseInt(limit) || 10;
    const currentPage = parseInt(page) || 1;

    const countBrand = await Brand.countDocuments(find);
    const totalPage = Math.ceil(countBrand / limitItems);
    const skip = (currentPage - 1) * limitItems;

    // Tìm kiếm
    const searchData = searchHelper(req.query);
    if (searchData.keyword) {
      find = { ...find, ...searchData.condition };
    }

    // Sắp xếp
    const sort = {};
    if (
      sortKey &&
      sortType &&
      sortKey !== "undefined" &&
      sortKey !== "default"
    ) {
      // Mongoose cho phép 'asc'/'desc' hoặc 1/-1
      sort[sortKey] = sortType === "desc" ? -1 : 1;
    }

    // Lấy danh sách thương hiệu
    const brands = await Brand.find(find)
      .sort(sort)
      .limit(limitItems)
      .skip(skip);

    // Trả kết quả
    res.json({
      code: 200,
      data: {
        brands,
        totalPage,
        currentPage,
      }
    });
  } catch (error) {
    console.error(error);
    res.json({
      code: 400,
      message: "Lỗi: " + error.message,
    });
  }
};

// [GET] /api/v1/brands/all
module.exports.all = async (req, res) => {
  try {
    let find = { deleted: false };
    const brands = await Brand.find(find);

    // Trả kết quả
    res.json({
      code: 200,
      data: brands
    });
  } catch (error) {
    console.error(error);
    res.json({
      code: 400,
      message: "Lỗi: " + error.message,
    });
  }
};

// [POST] /api/v1/brands/create-item
module.exports.createItem = async (req, res) => {
  try {
    if (!req.body.position) {
      const countItem = await Brand.countDocuments({ deleted: false });
      req.body.position = countItem + 1;
    } else {
      req.body.position = parseInt(req.body.position);
    }

    req.body.createBy = {
      user_Id: req.userAuth.id
    }

    const brand = new Brand(req.body);
    await brand.save();
    res.json({
      code: 200,
      message: "Tạo mới thành công",
      data: brand
    });
  } catch (error) {

    res.json({
      code: 400,
      message: "Tạo mới thương hiệu không thành công! - " + error
    });
  }
}

// [GET] /api/v1/brands/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const status = req.params.status;

    const updatedBy = {
      user_Id: req.userAuth.id,
      updatedAt: new Date()
    }

    await Brand.updateOne({
      _id: id
    }, {
      status: status,
      $push: { updatedBy: updatedBy }
    })

    res.json({
      code: 200,
      message: "Cập nhập trạng thái thành công"
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Lỗi " + error.message
    });
  }
  // bên phía client sẽ gửi yêu cầu lên params : /api/v1/products/change-status/active/669f264330dd29a6f8ad7bc3
}

// [PATCH] /api/v1/brands/edit-item/:id
module.exports.editPatch = async (req, res) => {
  try {
    const id = req.params.id;

    const { ...dataEdit } = req.body;

    const updatedBy = {
      user_Id: req.userAuth.id,
      updatedAt: new Date()
    }

    const updateQuery = {
      $set: dataEdit,            // mọi field khác
      $push: { updatedBy }       // log lịch sử
    };

    await Brand.updateOne({
      _id: id
    }, updateQuery);

    res.json({
      code: 200,
      message: "Chỉnh sửa thành công"
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Lỗi " + error.message
    });
  }
}

// [DELETE] /api/v1/brands/delete-item/:id
module.exports.deleteItem = async (req, res) => {
  try {
    const id = req.params.id;
    const brand = await Brand.findOne({ _id: id }).select("_id");

    if (!brand) {
      res.json({
        code: 400,
        message: "Không tìm thấy thương hiệu!"
      });
      return;
    }

    const deletedBy = {
      user_Id: req.userAuth.id,
      deletedAt: new Date()
    }

    await Brand.updateOne({
      _id: id
    }, {
      deleted: true,
      deletedAt: new Date(),
      deletedBy: deletedBy
    });

    res.json({
      code: 200,
      message: "Xóa thành công"
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Lỗi " + error.message
    });
  }
}