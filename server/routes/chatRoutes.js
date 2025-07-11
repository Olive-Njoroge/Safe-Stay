const express = require('express');
const { createChat, getAllChats, getChatsByTenant } = require('../controllers/chatController');

const router = express.Router();

// ✅ Create new chat message
router.post('/', createChat);

// ✅ Get all chats
router.get('/', getAllChats);

// ✅ Get chats by tenant name
router.get('/:tenantName', getChatsByTenant);

module.exports = router;
