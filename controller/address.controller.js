const Address = require("../models/address.model");

const createAddress = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      country,
      city,
      area,
      street,
      building,
      apartment,
      postalCode,
      isDefault,
    } = req.body;
    if (!fullName || !phone || !country || !city || !area || !street)
      return res.status(400).json({ 
    message: "Required address fields are missing" });
    if (isDefault === true)
      await Address.updateMany(
        { user: req.user.id, isDefault: true },
        { $set: { isDefault: false } },
      );
    const hasDefault = await Address.exists({
      user: req.user.id,
      isDefault: true,
    });
    const address = await Address.create({
      user: req.user.id,
      fullName,
      phone,
      country,
      city,
      area,
      street,
      building,
      apartment,
      postalCode,
      isDefault: isDefault === true || !hasDefault,
    });
    res.status(201).json({ 
      message: "Address created successfully", address });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to create address", error: error.message });
  }
};
const getUserAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort({
      isDefault: -1,
      createdAt: -1,
    });
    res.status(200).json({ addresses });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to get addresses", error: error.message });
  }
};
const getAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!address) return res.status(404).json({ 
      message: "Address not found" });
    res.status(200).json({ address });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to get address", error: error.message });
  }
};
const updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!address) return res.status(404).json({ 
      message: "Address not found" });
    const fields = [
      "fullName",
      "phone",
      "country",
      "city",
      "area",
      "street",
      "building",
      "apartment",
      "postalCode",
    ];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) address[field] = req.body[field];
    });
    if (req.body.isDefault === true) {
      await Address.updateMany(
        { user: req.user.id, _id: { $ne: address._id } },
        { $set: { isDefault: false } },
      );
      address.isDefault = true;
    }
    if (req.body.isDefault === false) address.isDefault = false;
    await address.save();
    res.status(200).json({ 
      message: "Address updated successfully", address });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to update address", error: error.message });
  }
};
const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!address) return res.status(404).json({ 
      message: "Address not found" });
    const wasDefault = address.isDefault;
    await Address.findByIdAndDelete(address._id);
    if (wasDefault) {
      const next = await Address.findOne({ user: req.user.id }).sort({
        createdAt: 1,
      });
      if (next) {
        next.isDefault = true;
        await next.save();
      }
    }
    res.status(200).json({ 
  message: "Address deleted successfully" });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to delete address", error: error.message });
  }
};
const setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!address) return res.status(404).json({ 
      message: "Address not found" });
    await Address.updateMany(
      { user: req.user.id, _id: { $ne: address._id } },
      { $set: { isDefault: false } },
    );
    address.isDefault = true;
    await address.save();
    res.status(200).json({ 
  message: "Default address updated successfully", address });
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to set default address", error: error.message });
  }
};
module.exports = {
  createAddress,
  getUserAddresses,
  getAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
