const Chat = require('../models/Chat');
const User = require('../models/User');

const handleSocketConnection = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected", socket.id);

    socket.on("joinRoom", async ({ username, roomId }) => {
      const user = await User.findOneAndUpdate(
        { name: username },
        { socketId: socket.id, isOnline: true },
        { new: true }
      );

      if (!user) return;

      socket.join(roomId);
      socket.join("global");
      
      // Emit to global room so all users see online status
      io.to("global").emit("userJoined", { user, roomId: "global" });

      // Typing handlers
      socket.on("typing", () => {
        socket.to(roomId).emit("typing", username);
      });

      socket.on("stopTyping", () => {
        socket.to(roomId).emit("stopTyping", username);
      });

      // Send message - FIXED to handle all parameters from frontend
      socket.on("sendMessage", async ({ content, receiverName, senderName, senderId, receiverId }) => {
        try {
          console.log("📨 Socket message received:", { content, receiverName, senderName, senderId, receiverId });
          
          const receiver = await User.findOne({ name: receiverName });
          if (!receiver) {
            console.error("❌ Receiver not found:", receiverName);
            return;
          }

          // Create message in database
          const message = await Chat.create({
            senderName: senderName || user.name,
            receiverName: receiver.name,
            senderId: senderId || user._id,
            receiverId: receiverId || receiver._id,
            senderRole: user.role,
            receiverRole: receiver.role,
            apartmentName: user.apartmentName,
            message: content
          });

          // Populate the message with sender info to match frontend expectations
          const populatedMessage = await Chat.findById(message._id)
            .populate('senderId', 'name role')
            .populate('receiverId', 'name role');

          console.log("✅ Message created and populated:", populatedMessage);

          // Send to both users
          // Don't send to sender (they already have it from API response)
          // Only send to receiver
          if (receiver.socketId && receiver.socketId !== socket.id) {
            console.log("📤 Sending to receiver socket:", receiver.socketId);
            io.to(receiver.socketId).emit("newMessage", populatedMessage);
          } else {
            console.log("⚠️ Receiver not online or same as sender");
          }

          // Also emit to global room for any other listeners
          socket.to("global").emit("newMessage", populatedMessage);

        } catch (error) {
          console.error("❌ Message sending error:", error);
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
          io.to("global").emit("userOffline", offlineUser.name);
        }
      });
    });
  });
};

module.exports = handleSocketConnection;