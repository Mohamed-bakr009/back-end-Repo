const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db.config");
const { notFound, errorHandler } = require("./middleware/error.middleware");

const authRouter = require("./router/auth.router");
const userRouter = require("./router/user.router");
const categoryRouter = require("./router/category.router");
const subcategoryRouter = require("./router/subcategory.router");
const seasonRouter = require("./router/season.router");
const addressRouter = require("./router/address.router");
const productRouter = require("./router/product.router");
const cartRouter = require("./router/cart.router");
const orderRouter = require("./router/order.router");
const policyRouter = require("./router/policy.router");
const shippingFeeRouter = require("./router/shippingFee.router");
const testimonialRouter = require("./router/testimonial.router");
const notificationRouter = require("./router/notification.router");
const reportRouter = require("./router/report.router");

const path = require("path");
const app = express();

connectDB();

app.use(cors({ origin: process.env.FRONTEND_URL || true, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/files", express.static(path.join(__dirname, "public", "files")));

app.get("/", (req, res) => res.json({ message: "E-commerce API is running" }));
app.get("/health", (req, res) => res.json({ status: "ok" }));

const api = express.Router();
api.use("/auth", authRouter);
api.use("/users", userRouter);
api.use("/categories", categoryRouter);
api.use("/subcategories", subcategoryRouter);
api.use("/seasons", seasonRouter);
api.use("/addresses", addressRouter);
api.use("/products", productRouter);
api.use("/cart", cartRouter);
api.use("/orders", orderRouter);
api.use("/policies", policyRouter);
api.use("/shipping-fees", shippingFeeRouter);
api.use("/testimonials", testimonialRouter);
api.use("/notifications", notificationRouter);
api.use("/reports", reportRouter);

app.use("/api/v1", api);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 3000;

app.listen(port, (_) => {
  console.log(`Server running on port ${port}`);
});
