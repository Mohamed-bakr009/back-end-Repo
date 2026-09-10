const User = require("../models/user.model");

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Failed to get users", error: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Failed to get user", error: error.message });  
    
}
}

const updateUser = async (req, res) => {
  try {
    const allowed = ["name", "phone", "gender", "DOB"];
    const data = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowed.includes(key)),
    );
    const user = await User.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user", error: error.message });
  }
};

const toggleBlock = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({
      message: user.isBlocked
        ? "User blocked successfully"
        : "User unblocked successfully",
      user: { id: user._id, isBlocked: user.isBlocked },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user status", error: error.message });
  }
};

module.exports = { getUsers, getUser, updateUser, toggleBlock }
