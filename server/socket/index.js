const Chat = require('../models/Chat');
const User = require('../models/User');

const handleSocketConnection = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected", socket.id);

    socket.on("joinRoom", async ({ username, roomId }) => {
      const user = await User.findOneAndUpdate(
        { name: username }, // use `name` instead of `username`
        { socketId: socket.id, isOnline: true },
        { new: true }
      );

      if (!user) return;

      socket.join(roomId);
      io.to(roomId).emit("userJoined", { user, roomId });

      // Typing
      socket.on("typing", () => {
        socket.to(roomId).emit("typing", username);
      });

      socket.on("stopTyping", () => {
        socket.to(roomId).emit("stopTyping", username);
      });

      // Send message (broadcast only, don't create duplicate in DB)
      socket.on("sendMessage", async ({ content, receiverName, senderName, senderId, receiverId, messageId }) => {
        try {
          const receiver = await User.findOne({ name: receiverName });
          
          if (!receiver) return;

          // Just broadcast the message, don't create it in DB (already created by API)
          const messageData = {
            _id: messageId,
            senderName,
            receiverName,
            senderId: { _id: senderId, name: senderName },
            receiverId: { _id: receiverId, name: receiverName },
            message: content,
            createdAt: new Date(),
            timestamp: new Date()
          };

          io.to(roomId).emit("newMessage", messageData);
        } catch (error) {
          console.error("Message broadcasting error:", error);
        }
      });

      // Disconnect
      socket.on("disconnect", async () => {
        const offlineUser = await User.findOneAndUpdate(
          { socketId: socket.id },
          { isOnline: false },
          { new: true }
        );

        if (offlineUser) {
          io.emit("userOffline", offlineUser.name);
        }
      });
    });
  });
};

module.exports = handleSocketConnection;