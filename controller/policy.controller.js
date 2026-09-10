const Policy = require("../models/policy.model");
const create = async (req, res) => {
  try {
    const { type, title, content } = req.body;
    if (!type || !title || !content)
      return res.status(400).json({ message: "Type, title and content are required" });
    const exists = await Policy.findOne({ type });
    if (exists)
      return res.status(409).json({ message: "Policy type already exists" });
    const policy = await Policy.create({ type, title, content });
    res.status(201).json({ message: "Policy created successfully", policy });
  } catch (error) {
    res.status(500).json({ message: "Failed to create policy", error: error.message });
  }
};
const getAll = async (req, res) => {
  try {
    const policies = await Policy.find(
      req.query.includeDeleted === "true"
        ? {}
        : { isDeleted: false, isActive: true },
    ).sort({ type: 1 });
    res.json({ policies });
  } catch (error) {
    res.status(500).json({ message: "Failed to get policies", error: error.message });
  }
};
const getOne = async (req, res) => {
  try {
    const policy = await Policy.findOne({
      type: req.params.type,
      isDeleted: false,
    });
    if (!policy) return res.status(404).json({ message: "Policy not found" });
    res.json({ policy });
  } catch (error) {
    res.status(500).json({ message: "Failed to get policy", error: error.message });
  }
};
const update = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy || policy.isDeleted)
      return res.status(404).json({ message: "Policy not found" });
    ["title", "content"].forEach((f) => {
      if (req.body[f] !== undefined) policy[f] = req.body[f];
    });
    if (req.body.type !== undefined && req.body.type !== policy.type) {
      const exists = await Policy.findOne({
        type: req.body.type,
        _id: { $ne: policy._id },
      });
      if (exists)
        return res.status(409).json({ message: "Policy type already exists" });
      policy.type = req.body.type;
    }
    await policy.save();
    res.json({ message: "Policy updated successfully", policy });
  } catch (error) {
    res.status(500).json({ message: "Failed to update policy", error: error.message });
  }
};
const remove = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) return res.status(404).json({ message: "Policy not found" });
    policy.isDeleted = true;
    policy.isActive = false;
    policy.deletedAt = new Date();
    await policy.save();
    res.json({ message: "Policy deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete policy", error: error.message });
  }
};
const restore = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy) return res.status(404).json({ message: "Policy not found" });
    policy.isDeleted = false;
    policy.isActive = true;
    policy.deletedAt = null;
    await policy.save();
    res.json({ message: "Policy restored successfully", policy });
  } catch (error) {
    res.status(500).json({ message: "Failed to restore policy", error: error.message });
  }
};
const status = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);
    if (!policy || policy.isDeleted)
      return res.status(404).json({ message: "Policy not found" });
    policy.isActive = !policy.isActive;
    await policy.save();
    res.json({ message: "Policy status updated successfully", policy });
  } catch (error) {
    res.status(500).json({  
        message: "Failed to update policy status",
        error: error.message,
      });
  }
};
module.exports = { create, getAll, getOne, update, remove, restore, status };
