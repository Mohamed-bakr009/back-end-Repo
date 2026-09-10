const express = require("express");
const controls = require("../controller/report.controller");
const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/role.middleware");
const router = express.Router();
router.use(auth, admin("admin"));
router.get("/summary", controls.salesSummary);
router.get("/daily", controls.salesByDay);
module.exports = router;
