const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/brands.controller");
const { brandValidationRules, brandValid } = require("../../validates/admin/brands.validate");
const checkPermission = require("../../middlewares/admin/checkPermission.middleware");

router.get("/", checkPermission.checkPermission("brands_view"), controller.index);

router.get("/all", checkPermission.checkPermission("brands_view"),
  controller.all);

router.get("/change-status/:status/:id", checkPermission.checkPermission("brands_edit"),
  controller.changeStatus);

router.delete("/delete-item/:id", checkPermission.checkPermission("brands_del"),
  controller.deleteItem);

router.post("/create-item", checkPermission.checkPermission("brands_create"),
  brandValidationRules, brandValid, controller.createItem);

router.patch("/edit-item/:id", checkPermission.checkPermission("brands_edit"),
  brandValidationRules, brandValid, controller.editPatch);

module.exports = router;