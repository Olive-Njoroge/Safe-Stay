const express = require('express');
const { createChat, getAllChats, getChatsByNationalID } = require('../controllers/chatController');

const router = express.Router();

// ✅ Create new chat message
router.post('/', createChat);

// ✅ Get all chats
router.get('/', getAllChats);

// ✅ Get chats by user National ID
router.get('/:nationalID', getChatsByNationalID);

module.exports = router;
