const Notification = require("../models/notification.model");
const getMine = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.id,
    }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({
       message: "Failed to get notifications", error: error.message });
  }
};
const unreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false,
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ 
        message: "Failed to get unread count", error: error.message });
  }
};
const markRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true },
      { new: true },
    );
    if (!notification)
      return res.status(404).json({ message: "Notification not found" });
    res.json({ message: "Notification marked as read", notification });
  } catch (error) {
    res.status(500).json({
       message: "Failed to mark notification", error: error.message });
  }
};
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true },
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to mark notifications",
      error: error.message,
    });
  }
};
module.exports = { getMine, unreadCount, markRead, markAllRead };
