const express = require('express');
const { getUserProfile, getAllTenants } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// 👉 Get logged-in user's profile (Protected)
router.get('/profile', protect, getUserProfile);

// 👉 Get all tenants (Landlord/Admin only) (Protected)
router.get('/tenants', protect, getAllTenants);

module.exports = router;
