const express = require("express");
const controls = require("../controller/category.controller");
const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/role.middleware");
const router = express.Router();
router.get("/", controls.getCategories);
router.get("/:id", controls.getCategory);
router.post("/create", auth, admin("admin"), controls.createCategory);
router.patch("/update/:id", auth, admin("admin"), controls.updateCategory);
router.patch("/delete/:id", auth, admin("admin"), controls.deleteCategory);
router.patch("/restore/:id", auth, admin("admin"), controls.restoreCategory);
router.patch(
  "/status/:id",
  auth,
  admin("admin"),
  controls.toggleCategoryStatus,
);
module.exports = router;
