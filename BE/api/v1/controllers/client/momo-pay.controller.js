const Order = require("../../models/order.model.js");
const sendMailHelper = require("../../../../helpers/sendMail");
const Product = require("../../models/product.model.js");
const Voucher = require("../../models/voucher.model.js");
const productHelper = require("../../../../helpers/products");
const {
  renderProductsTable,
} = require("../../../../helpers/renderProductsTable");
const crypto = require("crypto");
const axios = require("axios");
const Transactions = require("../../models/transactions.model.js");
const VoucherGift = require("../../models/voucher-gift.model.js");
const { getMomoErrorMessage } = require("../../../../helpers/momoErrorHelper.js");

// [POST] /momo-pay/create-payment
module.exports.createPayment = async (req, res) => {
  try {
    const { code, amount, orderInfo } = req.body;

    const order = await Order.findOne({ code: code }).select("code voucher_code")

    // Nếu có voucher
    if (order.voucher_code) {
      // Kiểm tra voucher hệ thống
      const voucher = await Voucher.findOne({
        voucher_code: order.voucher_code,
        status: "active",
        deleted: false
      });

      // Kiểm tra voucher quà tặng
      const voucherGift = await VoucherGift.findOne({
        code: order.voucher_code,
        owner: order.user_id,
        used: false
      });

      // Nếu không tồn tại voucher nào
      if (!voucher && !voucherGift) {
        await Promise.all([
          Order.updateOne(
            { code },
            { $unset: { voucher_code: "" }, $set: { discountAmount: 0 } }
          ),
          Transactions.deleteMany({ code_TxnRef: code, status: "pending" }) // ✅ Xóa transaction cũ
        ]);

        return res.json({
          code: 202,
          message: "Không tìm thấy voucher!"
        });
      }

      const now = Date.now();

      // Kiểm tra hạn sử dụng
      if (
        (voucher && now > new Date(voucher.end_date).getTime()) ||
        (voucherGift && now > new Date(voucherGift.expiredAt).getTime())
      ) {
        await Promise.all([
          Order.updateOne(
            { code },
            { $unset: { voucher_code: "" }, $set: { discountAmount: 0 } }
          ),
          Transactions.deleteMany({ code_TxnRef: code, status: "pending" }) // ✅ Xóa transaction cũ
        ]);

        return res.json({
          code: 202,
          message: "Voucher đã hết hạn!"
        });
      }

      // Kiểm tra số lượng
      if (voucher && voucher.quantity <= voucher.used_count) {
        await Promise.all([
          Order.updateOne(
            { code },
            { $unset: { voucher_code: "" }, $set: { discountAmount: 0 } }
          ),
          Transactions.deleteMany({ code_TxnRef: code, status: "pending" }) // ✅ Xóa transaction cũ
        ]);

        return res.json({
          code: 202,
          message: "Số lượng voucher đã hết!"
        });
      }
    }

    // Kiểm tra đã thanh toán chưa
    const existPaid = await Transactions.findOne({
      status: "paid",
      code_TxnRef: code,
    });
    if (existPaid) {
      res.json({
        code: 204,
        message: "Bạn đã thanh toán đơn hàng này, load lại trang để xem chi tiết!"
      });
      return;
    }
    //end 

    // Kiểm tra đã tạo giao dịch trước đó
    const existTxn = await Transactions.findOne({
      code_TxnRef: code,
      provider: "momo",
      status: { $in: ["pending", "expired", "failed"] }
    });

    const realAmount = order.totalOrder - order.discountAmount + order.shippingFee;

    // Nếu có transaction đang chờ hoặc đã hết hạn nhưng số tiền không khớp → xóa để tạo lại
    if (existTxn && existTxn.amount !== realAmount) {
      await Transactions.deleteMany({
        code_TxnRef: code,
        provider: "momo",
        status: { $in: ["pending", "expired", "failed"] } // ✅ xóa cả failed để làm sạch
      });
    }
    // Nếu có transaction hợp lệ (số tiền đúng) và vẫn đang chờ hoặc hết hạn nhẹ thì trả về link cũ
    else if (existTxn) {
      return res.json({
        code: 200,
        payUrl: existTxn.paymentUrl
      });
    }
    // end

    // 🔐 Thông tin cấu hình MoMo
    const partnerCode = process.env.PARTNER_CODE;
    const accessKey = process.env.ACCESS_KEY;
    const secretKey = process.env.SECRET_KEY;
    const redirectUrl = process.env.REDIRECT_URL;
    const ipnUrl = process.env.IPN_URL;

    const requestId = partnerCode + Date.now();
    const orderId = requestId;
    const requestType = "captureWallet";
    const extraData = "";

    // ⚙️ Tạo chữ ký (signature)
    const rawSignature =
      `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}` +
      `&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    // 🧾 Dữ liệu gửi đi MoMo
    const requestBody = {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType,
      signature,
      lang: "vi",
    };

    // 🚀 Gửi request đến MoMo Sandbox
    const response = await axios.post(
      "https://test-payment.momo.vn/v2/gateway/api/create",
      requestBody,
      { headers: { "Content-Type": "application/json" } }
    );

    // Lưu thông tin đơn hàng lại
    await Transactions.create({
      code_TxnRef: code,
      amount: Number(amount),
      orderInfo: orderInfo,
      paymentUrl: response.data.payUrl,
      provider: "momo"
    });

    res.json({
      code: 201,
      payUrl: response.data.payUrl
    });
    return;
  } catch (error) {
    console.error(
      "❌ Lỗi tạo thanh toán MoMo:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      code: 500,
      message: "Lỗi tạo thanh toán MoMo" + error.message,
      error: error.response?.data || error.message,
    });
  }
};

// [GET] /momo-pay/payment-return
module.exports.paymentReturn = async (req, res) => {
  try {
    const momoResponse = req.query; // Lưu toàn bộ phản hồi MoMo
    const { resultCode, orderInfo, transId, message, payType } = momoResponse;

    // Lấy mã đơn hàng từ orderInfo (VD: "Thanh toán đơn hàng DH123")
    const code = orderInfo?.split(" đơn hàng ")[1];

    // Cập nhật transaction
    await Transactions.updateOne(
      { code_TxnRef: code, provider: "momo" },
      {
        status: resultCode === "0" ? "paid" : "failed",
        responseCode: resultCode,
        transactionNo: transId,
        payType,
        errorMessage:
          resultCode === "0"
            ? null
            : message || getMomoErrorMessage(resultCode),
        rawResponse: momoResponse,
      }
    );

    // Redirect tương ứng
    if (resultCode === "0") {
      return res.redirect(
        `${process.env.FRONTEND_URL}/order/checkout/pay/success/${code}`
      );
    } else {
      return res.redirect(
        `${process.env.FRONTEND_URL}/order/checkout/pay/fail/${code}`
      );
    }
  } catch (error) {
    console.error("❌ Momo payment return error:", error);

    // Trường hợp lỗi ngoài ý muốn
    return res.redirect(
      `${process.env.FRONTEND_URL}/order/checkout/pay/fail/unknown`
    );
  }
};

// [POST] /momo-pay/payment-notify
module.exports.momoCallback = async (req, res) => {
  //   MoMo Callback: {
  //   partnerCode: 'MOMO2JUC20251011_TEST',
  //   orderId: 'MOMO2JUC20251011_TEST1760200722705',
  //   requestId: 'MOMO2JUC20251011_TEST1760200722705',
  //   amount: 793800,
  //   orderInfo: 'Thanh toán đơn hàng ORD13154511102025',
  //   orderType: 'momo_wallet',
  //   transId: 4591880358,
  //   resultCode: 0,
  //   message: 'Thành công.',
  //   payType: 'qr',
  //   responseTime: 1760200732232,
  //   extraData: '',
  //   signature: '34a2c66ad00e3d3a9e087c476c2f881a18c2393a1a40889d58b3c2d4228b9c93'
  // }

  const { orderInfo, resultCode } = req.body;
  const code = orderInfo.split(" đơn hàng ")[1];

  if (resultCode === 0) {
    await Transactions.updateOne(
      {
        code_TxnRef: code,
        provider: "momo"
      },
      { status: "paid" }
    );

    const order = await Order.findOne({ code: code }).lean();

    await Order.updateOne(
      { code: code },
      {
        status: "received",
        paymentMethod: "bank-momo",
      }
    );

    // gửi opt qua email user
    const subject = "Khách hàng đã xác nhận thanh toán đơn hàng";
    const html = `
          <p>Mã đơn hàng <b>${code}</b></p>
          <p>Tên khách hàng <b>${order.userInfo.fullName}</b></p>
          <p>Phương thức thanh toán <b>Bank</b></p>
        `;
    sendMailHelper.sendMail("ttanhoa4455@gmail.com", subject, html);

    // gửi thông tin đơn hàng
    const products = [];
    let totalQuantity = 0;

    if (order.products.length > 0) {
      // tổng số lượng sản phẩm của đơn hàng
      for (const product of order.products) {
        const priceNew = productHelper.priceNew(product);

        totalQuantity += product.quantity;

        const infoProduct = await Product.findOne({
          _id: product.product_id,
          deleted: false,
          status: "active",
        }).select("title discountPercentage");

        const objProducts = {
          priceNew: priceNew,
          quantity: product.quantity,
          discountPercentage: infoProduct.discountPercentage,
          size: product.size,
          title: infoProduct.title,
        };
        products.push(objProducts);
      }
    }

    // gửi email den user
    const subject2 =
      "Đơn hàng của bạn đã được xác nhận, đơn hàng sẽ được giao đến bạn sớm nhất";
    const productsTableHTML = renderProductsTable(products); // `products` là mảng bạn đã có

    const html2 = `
          <p>Cảm ơn bạn đã đặt hàng tại cửa hàng chúng tôi!</p>
          <p><b>Mã đơn hàng:</b> ${order.code}</p>
          <p><b>Tên khách hàng:</b> ${order.userInfo.fullName}</p>
          <p><b>Phương thức thanh toán:</b> ${order.paymentMethod}</p>
          <br/>
          <p><b>Chi tiết đơn hàng:</b></p>
          ${productsTableHTML}
          <br/>
          <p><b>Tổng số lượng sản phẩm</b> ${totalQuantity}</p>
          <p><b>Tổng tiền đơn hàng</b> ${order.totalOrder.toLocaleString()} + ${order.shippingFee.toLocaleString()} đ</p>
          <a href="${process.env.FRONTEND_URL
      }/order/checkout/pay/success/${code}" style={{ textDecoration: "none" }} target="_blank" rel="noopener noreferrer">Xem chi tiết đơn hàng</a>
          <p>Trân trọng,<br/>Cửa hàng XYZ</p>
          `;
    sendMailHelper.sendMail(order.userInfo.email, subject2, html2);

    // Redirect về trang frontend
    return res.redirect(
      `${process.env.FRONTEND_URL}/order/checkout/pay/success/${code}`
    );
  } else {
    return res.redirect(
      `${process.env.FRONTEND_URL}/order/checkout/pay/fail/${code}`
    );
  }
};
