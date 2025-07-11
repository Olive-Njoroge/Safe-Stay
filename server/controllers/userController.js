const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// 👉 Register (Tenant or Landlord)
exports.registerUser = async (req, res) => {
  const { name, email, password, primaryPhoneNumber, secondaryPhoneNumber, nationalID, role, buildingName, dateMovedIn } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const newUser = await User.create({
      name,
      email,
      password,
      primaryPhoneNumber,
      secondaryPhoneNumber,
      nationalID,
      role,
      buildingName,
      dateMovedIn
    });

    const token = generateToken(newUser);

    res.status(201).json({
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 👉 Login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user);

    res.status(200).json({
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

// 👉 Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 👉 Get All Tenants (For Landlord/Admin)
exports.getAllTenants = async (req, res) => {
  try {
    const tenants = await User.find({ role: 'Tenant' }).select('-password');
    res.status(200).json(tenants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
