const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ✅ Register User (Tenant or Landlord)
exports.registerUser = async (req, res) => {
  const { name, email, password, nationalID, primaryPhoneNumber, secondaryPhoneNumber, role, buildingName, dateMovedIn } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      nationalID,
      primaryPhoneNumber,
      secondaryPhoneNumber,
      role,
      buildingName,      // Optional for Landlords
      dateMovedIn        // Optional for Tenants
    });

    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      token
    });

  } catch (error) {
    console.error("❌ Registration failed:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });

    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
