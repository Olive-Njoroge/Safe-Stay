const mongoose = require('mongoose');

const ussdSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  currentStep: { type: String, default: 'main_menu' },
  data: { type: Object, default: {} }, // Store temporary data during session
  isActive: { type: Boolean, default: true },
  expiresAt: { 
    type: Date, 
    default: Date.now, 
    expires: 300 // Session expires after 5 minutes
  }
}, { timestamps: true });

module.exports = mongoose.model('UssdSession', ussdSessionSchema);
