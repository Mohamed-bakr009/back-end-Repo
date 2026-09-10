const express = require("express");
const controls = require("../controller/subcategory.controller");
const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/role.middleware");
const router = express.Router();
router.get("/", controls.getSubcategories);
router.get("/:id", controls.getSubcategory);
router.post("/create", auth, admin("admin"), controls.createSubcategory);
router.patch("/update/:id", auth, admin("admin"), controls.updateSubcategory);
router.patch("/delete/:id", auth, admin("admin"), controls.deleteSubcategory);
router.patch("/restore/:id", auth, admin("admin"), controls.restoreSubcategory);
router.patch(
  "/status/:id",
  auth,
  admin("admin"),
  controls.toggleSubcategoryStatus,
);
module.exports = router;
