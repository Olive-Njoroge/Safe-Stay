const Chat = require('../models/Chat');
const User = require('../models/User');

// ✅ Create Chat
exports.createChat = async (req, res) => {
  const { senderNationalID, receiverNationalID, content, senderName, receiverName, senderRole, receiverRole } = req.body;

  try {
    const sender = await User.findOne({ nationalID: senderNationalID });
    const receiver = await User.findOne({ nationalID: receiverNationalID });

    if (!sender || !receiver) {
      return res.status(404).json({ message: 'Sender or receiver not found' });
    }

    const chat = await Chat.create({
      senderId: sender._id,
      receiverId: receiver._id,
      senderName,
      receiverName,
      senderRole,
      receiverRole,
      content
    });

    res.status(201).json({
      message: 'Chat created successfully',
      chat
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ✅ Get All Chats (with user names)
exports.getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate('senderId', 'name nationalID role')
      .populate('receiverId', 'name nationalID role')
      .sort({ createdAt: 1 });

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get Chats by NationalID (for one user’s chat history)
exports.getChatsByNationalID = async (req, res) => {
  const { nationalID } = req.params;

  try {
    const user = await User.findOne({ nationalID });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const chats = await Chat.find({
      $or: [
        { senderId: user._id },
        { receiverId: user._id }
      ]
    })
      .populate('senderId', 'name nationalID role')
      .populate('receiverId', 'name nationalID role')
      .sort({ createdAt: 1 });

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
