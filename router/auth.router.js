
const express = require("express");
const controls = require("../controller/authController");

const router = express.Router();

router.post("/register", controls.register);
router.post("/login", controls.login);

module.exports = router;
