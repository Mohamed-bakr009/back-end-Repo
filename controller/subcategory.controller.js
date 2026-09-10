const Subcategory = require("../models/subcategory.model");
const Category = require("../models/category.model");

const createSubcategory = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    if (!name || !category){
      return res.status(400) .json(
    { message: "Name and category are required" });
    }
    const parent = await Category.findOne({ _id: category, isDeleted: false });
    if (!parent) {
      return res.status(404).json({ message: "Category not found" });
    }
    const subcategory = await Subcategory.create({name,category,description,});
    res.status(201).json({
       message: "Subcategory created successfully", subcategory });
  } catch (error) {
    res.status(500).json({
       message: "Failed to create subcategory", error: error.message });
  }
};
const getSubcategories = async (req, res) => {
  try {
    const filter = { isDeleted: false };
    if (req.query.category) filter.category = req.query.category;
    const subcategories = await Subcategory.find(filter)
      .populate("category", "name")
      .sort({ createdAt: -1 });
    res.json({ subcategories });
  } catch (error) {
    res.status(500).json({
       message: "Failed to get subcategories", error: error.message });
  }
};
const getSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id).populate(
      "category",
      "name",
    );
    if (!subcategory)
      return res.status(404).json({ message: "Subcategory not found" });
    res.json({ subcategory });
  } catch (error) {
    res.status(500).json({
       message: "Failed to get subcategory", error: error.message });
  }
};
const updateSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id);
    if (!subcategory || subcategory.isDeleted)
      return res.status(404).json({ message: "Subcategory not found" });
    const { name, category, description } = req.body;
    if (category !== undefined) {
      const parent = await Category.findOne({
        _id: category,
        isDeleted: false,
      });
      if (!parent)
        return res.status(404).json({ message: "Category not found" });
      subcategory.category = category;
    }
    if (name !== undefined) subcategory.name = name;
    if (description !== undefined) subcategory.description = description;
    await subcategory.save();
    res.json({ message: "Subcategory updated successfully", subcategory });
  } catch (error) {
    res.status(500).json({
       message: "Failed to update subcategory", error: error.message });
  }
};
const deleteSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id);
    if (!subcategory || subcategory.isDeleted)
      return res.status(404).json({ message: "Subcategory not found" });
    subcategory.isDeleted = true;
    subcategory.isActive = false;
    subcategory.deletedAt = new Date();
    await subcategory.save();
    res.json({ message: "Subcategory deleted successfully" });
  } catch (error) {
    res.status(500).json({
       message: "Failed to delete subcategory", error: error.message });
  }
};
const restoreSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id);
    if (!subcategory)
      return res.status(404).json({ message: "Subcategory not found" });
    subcategory.isDeleted = false;
    subcategory.isActive = true;
    subcategory.deletedAt = null;
    await subcategory.save();
    res.json({ message: "Subcategory restored successfully", subcategory });
  } catch (error) {
    res.status(500).json({
       message: "Failed to restore subcategory", error: error.message });
  }
};
const toggleSubcategoryStatus = async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id);
    if (!subcategory || subcategory.isDeleted)
      return res.status(404).json({ message: "Subcategory not found" });
    subcategory.isActive = !subcategory.isActive;
    await subcategory.save();
    res.json({
      message: "Subcategory status updated successfully",
      subcategory,
    });
  } catch (error) {
    res.status(500).json({
        message: "Failed to update subcategory status",
        error: error.message,
      });
  }
};
module.exports = {
  createSubcategory,
  getSubcategories,
  getSubcategory,
  updateSubcategory,
  deleteSubcategory,
  restoreSubcategory,
  toggleSubcategoryStatus,
};
