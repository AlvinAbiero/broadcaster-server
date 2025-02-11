const User = require("../models/User");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: "All fields are required" });
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    const user = new User({ username, password });
    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "All fields are required" });

  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Issue a JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error logging in",
      error,
    });
  }
};
