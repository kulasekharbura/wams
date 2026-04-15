const User = require("../models/User");

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // 1. Check if the user exists in the database
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // 2. Validate password (Plain text for prototype)
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // 3. Validate role (Optional extra security check)
    if (user.role !== role) {
      return res
        .status(403)
        .json({ message: `Access denied. User is not a ${role}.` });
    }

    // 4. Success! Send back the user data (In production, you'd send a JWT here)
    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during authentication" });
  }
};

module.exports = {
  loginUser,
};
