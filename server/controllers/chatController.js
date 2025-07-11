const Chat = require('../models/Chat');

// Create Chat (moved here from routes)
exports.createChat = async (req, res) => {
  try {
    const chat = await Chat.create(req.body);
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Chats
exports.getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find().sort({ createdAt: 1 });
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Chats by Tenant Name
exports.getChatsByTenant = async (req, res) => {
  const { tenantName } = req.params;
  try {
    const chats = await Chat.find({
      $or: [
        { senderName: tenantName },
        { receiverName: tenantName }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
