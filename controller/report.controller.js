const Order = require("../models/order.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");

const salesSummary = async (req, res) => {
  try {
    const { from, to } = req.query;
    const match = { orderStatus: { $nin: ["cancelled"] } };
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }

    const [totals] = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
    ]);

    const byStatus = await Order.aggregate([
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]);

    const [productsCount, usersCount] = await Promise.all([
      Product.countDocuments({ isDeleted: false }),
      User.countDocuments({ role: "user" }),
    ]);

    res.json({
      totalOrders: totals?.totalOrders || 0,
      totalRevenue: totals?.totalRevenue || 0,
      ordersByStatus: byStatus.reduce(
        (acc, s) => ({ ...acc, [s._id]: s.count }),
        {},
      ),
      productsCount,
      usersCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to build sales report", error: error.message });
  }
};

const salesByDay = async (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const rows = await Order.aggregate([
      { $match: { createdAt: { $gte: since }, orderStatus: { $ne: "cancelled" } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json({ days: rows });
  } catch (error) {
    res.status(500).json({ message: "Failed to build daily report", error: error.message });
  }
};

module.exports = { salesSummary, salesByDay };
