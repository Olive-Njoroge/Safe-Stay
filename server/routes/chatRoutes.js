const express = require('express');
const { createChat, getAllChats, getChatsByNationalID, getMyChats, getConversation, getMyConversations, getAvailableChatPartners, debugUsers } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ✅ Create new chat message (Protected)
router.post('/', protect, createChat);

// ✅ Get my chats (Protected)
router.get('/me', protect, getMyChats);

// ✅ Get my conversations (Protected)
router.get('/conversations', protect, getMyConversations);

// ✅ Get available chat partners (Protected)
router.get('/partners', protect, getAvailableChatPartners);

// ✅ Get conversation between two users (Protected)
router.get('/conversation/:userId1/:userId2', protect, getConversation);

// ✅ Get all chats (Protected)
router.get('/', protect, getAllChats);

// ✅ Get chats by user National ID (Protected)
router.get('/user/:nationalID', protect, getChatsByNationalID);

// ✅ Debug endpoint to check users and apartments (Protected)
router.get('/debug/users', protect, debugUsers);

module.exports = router;
