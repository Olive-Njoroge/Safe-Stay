const Chat = require('../models/Chat');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);

    // Typing indicators (optional)
    socket.on('typing', (username) => {
      io.emit('typing', username);
    });

    socket.on('stopTyping', (username) => {
      io.emit('stopTyping', username);
    });

    // Send message
    socket.on('sendMessage', async (data) => {
      const { senderName, receiverName, senderRole, receiverRole, content } = data;

      try {
        const chat = await Chat.create({
          senderName,
          receiverName,
          senderRole,
          receiverRole,
          content
        });

        io.emit('newMessage', chat);
      } catch (error) {
        console.error('❌ Error saving message:', error.message);
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id);
    });
  });
};
