const express = require("express");
const controls = require("../controller/cart.controller");
const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return next();
  require("../middleware/auth.middleware")(req, res, next);
};
const router = express.Router();
router.use(optionalAuth);
router.get("/", controls.getCart);
router.post("/items", controls.addItem);
router.patch("/items/:itemId", controls.updateItem);
router.delete("/items/:itemId", controls.removeItem);
router.delete("/", controls.clearCart);
module.exports = router;
