const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  senderName: { type: String, required: true },
  receiverName: { type: String, required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, refPath: 'senderRole' },
  receiverId: { type: mongoose.Schema.Types.ObjectId, refPath: 'receiverRole' },
  senderRole: { type: String, enum: ['Tenant', 'Landlord'], required: true },
  receiverRole: { type: String, enum: ['Tenant', 'Landlord'], required: true },
  content: { type: String, required: true, trim: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
