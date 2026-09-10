const Testimonial = require("../models/testimonial.model");
const { notifyAdmins, createNotification } = require("../utils/notification");


const create = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message)
      return res.status(400).json({ message: "Message is required" });
    const testimonial = await Testimonial.create({
      user: req.user.id,
      name: req.user.name,
      message,
    });
    await notifyAdmins({
      type: "new_testimonial",
      title: "New testimonial",
      message: "A new testimonial is waiting for approval",
      relatedId: testimonial._id,
    });
    res.status(201).json({
       message: "Testimonial submitted successfully", testimonial });
  } catch (error) {
    res.status(500).json({
       message: "Failed to create testimonial", error: error.message });
  }
};
const getApproved = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({
      status: "approved",
      isDeleted: false,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json({ testimonials });
  } catch (error) {
    res.status(500).json({
       message: "Failed to get testimonials", error: error.message });
  }
};
const getAll = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isDeleted: false })
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json({ testimonials });
  } catch (error) {
    res.status(500).json({
       message: "Failed to get testimonials", error: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "approved", "declined"].includes(status))
      return res.status(400).json({ message: "Invalid testimonial status" });
    const testimonial = await Testimonial.findOne({
      _id: req.params.id,
      isDeleted: false,
    });
    if (!testimonial)
      return res.status(404).json({ message: "Testimonial not found" });
    testimonial.status = status;
    await testimonial.save();
    await createNotification({
      recipient: testimonial.user,
      type: "new_testimonial",
      title: "Testimonial status updated",
      message: `Your testimonial was ${status}`,
      relatedId: testimonial._id,
    });
    res.json({
      message: "Testimonial status updated successfully",
      testimonial,
    });
  } catch (error) {
    res.status(500).json({
        message: "Failed to update testimonial status",
        error: error.message,
      });
  }
};
const remove = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial)
      return res.status(404).json({ message: "Testimonial not found" });
    testimonial.isDeleted = true;
    testimonial.deletedAt = new Date();
    await testimonial.save();
    res.json({ message: "Testimonial deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete testimonial",
      error: error.message,
    });
  }
};
module.exports = { create, getApproved, getAll, updateStatus, remove };
