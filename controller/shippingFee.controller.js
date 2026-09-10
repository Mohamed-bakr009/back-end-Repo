const ShippingFee = require("../models/shippingFee.model");
const create = async (req, res) => {
  try {
    const { name, fee } = req.body;
    if (!name || fee === undefined)
      return res.status(400).json({ message: "Name and fee are required" });
    const shippingFee = await ShippingFee.create({ name, fee });
    res.status(201).json({
       message: "Shipping fee created successfully", shippingFee });
  } catch (error) {
    res.status(500).json({
       message: "Failed to create shipping fee", error: error.message });
  }
};
const getAll = async (req, res) => {
  try {
    const shippingFees = await ShippingFee.find(
      req.query.includeDeleted === "true" ? {} : { isDeleted: false },
    ).sort({ createdAt: -1 });
    res.json({ shippingFees });
  } catch (error) {
    res.status(500).json({  
     message: "Failed to get shipping fees", error: error.message });
  }
};
const getOne = async (req, res) => {
  try {
    const shippingFee = await ShippingFee.findById(req.params.id);
    if (!shippingFee)
      return res.status(404).json({ message: "Shipping fee not found" });
    res.json({ shippingFee });
  } catch (error) {
    res.status(500).json({
       message: "Failed to get shipping fee", error: error.message });
  }
};
const update = async (req, res) => {
  try {
    const shippingFee = await ShippingFee.findById(req.params.id);
    if (!shippingFee || shippingFee.isDeleted)
      return res.status(404).json({ message: "Shipping fee not found" });
    if (req.body.name !== undefined){
       shippingFee.name = req.body.name;
    }
    if (req.body.fee !== undefined) {
      shippingFee.fee = req.body.fee;
    }
    await shippingFee.save();
    res.json({ message: "Shipping fee updated successfully", shippingFee });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to update shipping fee", error: error.message });
  }
};
const remove = async (req, res) => {
  try {
    const shippingFee = await ShippingFee.findById(req.params.id);
    if (!shippingFee)
      return res.status(404).json({ message: "Shipping fee not found" });
    shippingFee.isDeleted = true;
    shippingFee.isActive = false;
    shippingFee.deletedAt = new Date();
    await shippingFee.save();
    res.json({ message: "Shipping fee deleted successfully" });
  } catch (error) {
    res.status(500).json({
       message: "Failed to delete shipping fee", error: error.message });
  }
};
const restore = async (req, res) => {
  try {
    const shippingFee = await ShippingFee.findById(req.params.id);
    if (!shippingFee){
      return res.status(404).json({ message: "Shipping fee not found" });
    }
    shippingFee.isDeleted = false;
    shippingFee.isActive = true;
    shippingFee.deletedAt = null;
    await shippingFee.save();
    res.json({ message: "Shipping fee restored successfully", shippingFee });
  } catch (error) {
    res.status(500).json({
        message: "Failed to restore shipping fee",
        error: error.message,
      });
  }
};
const status = async (req, res) => {
  try {
    const shippingFee = await ShippingFee.findById(req.params.id);
    if (!shippingFee || shippingFee.isDeleted)
      return res.status(404).json({ message: "Shipping fee not found" });
    shippingFee.isActive = !shippingFee.isActive;
    await shippingFee.save();
    res.json({
      message: "Shipping fee status updated successfully",
      shippingFee,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update shipping fee status",
      error: error.message,
    });
  }
};
module.exports = { create, getAll, getOne, update, remove, restore, status };
