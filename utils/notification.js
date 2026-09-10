const Notification = require("../models/notification.model");

const createNotification = async ({
  recipient,
  type,
  title,
  message,
  relatedId = null,
}) => {
  const notification = await Notification.create({
    recipient,
    type,
    title,
    message,
    relatedId,
  });

  return notification;
};

const notifyAdmins = async (data) => {
  const User = require("../models/user.model");

  const admins = await User.find({
    role: "admin",
    isBlocked: false,
  }).select("_id");

  await Promise.all(
    admins.map((admin) =>
      createNotification({
        ...data,
        recipient: admin._id,
      })
    )
  );
};

module.exports = {
  createNotification,
  notifyAdmins,
};