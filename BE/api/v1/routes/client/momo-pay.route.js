const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/momo-pay.controller");

router.post("/create-payment", controller.createPayment);
router.get("/payment-return", controller.paymentReturn);
router.post("/payment-notify", controller.momoCallback);

module.exports = router;
