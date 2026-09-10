const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const Address = require("../models/address.model");
const Product = require("../models/product.model");
const ShippingFee = require("../models/shippingFee.model");
const { notifyAdmins, createNotification } = require("../utils/notification");

const getPrice = (product) =>
  product.discountPrice !== null && product.discountPrice < product.price
    ? product.discountPrice
    : product.price;

const restoreStock = async (order) => {
  if (order.stockRestored) return;
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (!product) continue;
    product.stock += item.quantity;
    await product.save();
  }
  order.stockRestored = true;
  await order.save();
};

const createOrder = async (req, res) => {
  try {
    const { addressId, shippingFeeId } = req.body;
    if (!addressId)
      return res.status(400).json({ message: "Address is required" });
    const address = await Address.findOne({
      _id: addressId,
      user: req.user.id,
    });
    if (!address) return res.status(404).json({ message: "Address not found" });
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart || !cart.items.length)
      return res.status(400).json({ message: "Cart is empty" });
    let shippingFee = 0;
    if (shippingFeeId) {
      const fee = await ShippingFee.findOne({
        _id: shippingFeeId,
        isDeleted: false,
        isActive: true,
      });
      if (!fee)
        return res.status(404).json({ message: "Shipping fee not found" });
      shippingFee = fee.fee;
    } else {
      const fee = await ShippingFee.findOne({
        isDeleted: false,
        isActive: true,
      }).sort({ fee: 1 });
      if (fee) shippingFee = fee.fee;
    }
    const items = [];
    let subtotal = 0;
    for (const cartItem of cart.items) {
      const product = await Product.findOne({
        _id: cartItem.product,
        isDeleted: false,
        isActive: true,
      });
      if (!product)
        return res
          .status(400)
          .json({ message: "One or more products are unavailable" });
      if (product.stock < cartItem.quantity)
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
    
      const price = getPrice(product);
      const total = price * cartItem.quantity;
      subtotal += total;
      items.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        price,
        quantity: cartItem.quantity,
        total,
      });
    }
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (product.stock < item.quantity)
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      product.stock -= item.quantity;
      await product.save();
      if (product.stock <= 5)
        await notifyAdmins({
          type: "low_stock",
          title: "Low stock alert",
          message: `${product.name} has low stock`,
          relatedId: product._id,
        });
    }
    const order = await Order.create({
      user: req.user.id,
      items,
      shippingAddress: {
        fullName: address.fullName,
        phone: address.phone,
        country: address.country,
        city: address.city,
        area: address.area,
        street: address.street,
        building: address.building,
        apartment: address.apartment,
        postalCode: address.postalCode,
      },
      subtotal,
      shippingFee,
      totalPrice: subtotal + shippingFee,
    });
    cart.items = [];
    await cart.save();
    await notifyAdmins({
      type: "new_order",
      title: "New order",
      message: "A new order has been created",
      relatedId: order._id,
    });
    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product", "name images sku")
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Failed to get orders", error: error.message });
    
}
}
  
const getMyOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("items.product", "name images sku");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: "Failed to get order", error: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.orderStatus = req.query.status;
    const orders = await Order.find(filter)
      .populate("user", "name email phone")
      .populate("items.product", "name images sku")
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Failed to get orders", error: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const allowed = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    const { status } = req.body;
    if (!allowed.includes(status))
      return res.status(400).json({ message: "Invalid order status" });
    const order = await Order.findById(req.params.id);
    if (!order) 
      {return res.status(404).json({ message: "Order not found" })}
    if (order.orderStatus === "cancelled" || order.orderStatus === "refunded"){
      return res.status(400).json({ message: "Order is already closed" })}
    if (status === "cancelled" && order.orderStatus !== "cancelled"){
      await restoreStock(order);
    order.orderStatus = status;
    }
    if (status === "delivered")
       order.paymentStatus = "paid";
    await order.save();
    await createNotification({
      recipient: order.user,
      type: "new_order",
      title: "Order status updated",
      message: `Your order status is now ${status}`,
      relatedId: order._id,
    });
    res.json({ message: "Order status updated successfully", order });
  } catch (error) {
    res.status(500).json({
       message: "Failed to update order status", error: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!order){
       return res.status(404).json({ message: "Order not found" });
    }
    if (!["pending", "confirmed"].includes(order.orderStatus)){
      return res.status(400).json({ message: "Order cannot be cancelled now" });
    }
    await restoreStock(order);
    order.orderStatus = "cancelled";
    await order.save();
    res.json({ message: "Order cancelled successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel order", error: error.message });
  }
};

const requestRefund = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" })}
    if (order.orderStatus !== "delivered"){
      return res.status(400).json({ 
        message: "Refund can only be requested for delivered orders" })
    }
    order.orderStatus = "refund_requested";
    order.refund = {
      reason: reason || null,
      requestedAt: new Date(),
      processedAt: null,
    };
    await order.save();
    await notifyAdmins({
      type: "refund_request",
      title: "Refund request",
      message: "A customer requested a refund",
      relatedId: order._id,
    });
    res.json({ message: "Refund request submitted", order });
  } catch (error) {
    res.status(500).json({ message: "Failed to request refund", error: error.message });
  }
};

const processRefund = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!["refunded", "cancelled"].includes(status))
      return res.status(400).json({ message: "Invalid refund result" });
    if (status === "refunded") {
      order.orderStatus = "refunded";
      order.paymentStatus = "refunded";
    } else {
      order.orderStatus = "cancelled";
    }
    order.refund.processedAt = new Date();
    await order.save();
    await createNotification({
      recipient: order.user,
      type: "refund_request",
      title: "Refund request updated",
      message: `Your refund request was ${status}`,
      relatedId: order._id,
    });
    res.json({ message: "Refund processed successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Failed to process refund", error: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getMyOrder,
  getOrders,
  updateStatus,
  cancelOrder,
  requestRefund,
  processRefund,
};
