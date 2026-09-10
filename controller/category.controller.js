const Category = require("../models/category.model");

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description)
      return res
        .status(400)
        .json({ message: "Name and description are required" });
    const category = await Category.create({ name, description });
    res.status(201).json({
       message: "Category created successfully", category });
  } catch (error) {
    res.status(500).json({
         message: "Failed to create category", error: error.message });
  }
};
const getCategories = async (req, res) => {
  try {
    const filter =
      req.query.includeDeleted === "true" ? {} : { isDeleted: false };
    const categories = await Category.find(filter).sort({ createdAt: -1 });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({
         message: "Failed to get categories", error: error.message });
  }
};
const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.json({ category });
  } catch (error) {
    res.status(500).json({ 
        message: "Failed to get category", error: error.message });
  }
};
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category || category.isDeleted)
      return res.status(404).json({ message: "Category not found" });
    const { name, description } = req.body;
    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    await category.save();
    res.json({ message: "Category updated successfully", category });
  } catch (error) {
    res.status(500).json({
       message: "Failed to update category", error: error.message });
  }
};
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category || category.isDeleted)
      return res.status(404).json({ message: "Category not found" });
    category.isDeleted = true;
    category.isActive = false;
    category.deletedAt = new Date();
    await category.save();
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ 
        message: "Failed to delete category", error: error.message });
  }
};
const restoreCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    category.isDeleted = false;
    category.isActive = true;
    category.deletedAt = null;
    await category.save();
    res.json({ message: "Category restored successfully", category });
  } catch (error) {
    res.status(500).json({ 
        message: "Failed to restore category", error: error.message });
  }
};
const toggleCategoryStatus = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category || category.isDeleted)
      return res.status(404).json({ message: "Category not found" });
    category.isActive = !category.isActive;
    await category.save();
    res.json({ message: "Category status updated successfully", category });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update category status",
      error: error.message,
    });
  }
};
module.exports = {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  restoreCategory,
  toggleCategoryStatus,
};
