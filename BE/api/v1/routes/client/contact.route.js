const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/contact.controller");
const { createRateLimiter } = require("../../middlewares/apiLimiter.middleware");

router.post("/send",
  createRateLimiter(5,1),
  controller.sendContact);

module.exports = router;