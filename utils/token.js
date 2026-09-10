const jwt = require("jsonwebtoken");

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.SECRET_KEY,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );

module.exports = generateToken;
