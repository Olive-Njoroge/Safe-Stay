const mongoose = require('mongoose');

const landlordSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  nationalID: { type: String, required: true, unique: true, trim: true },
  primaryPhoneNumber: { type: String, required: true, trim: true },
  secondaryPhoneNumber: { type: String, trim: true },
  email: { type: String, trim: true },
  buildingsManaged: [{ type: String, trim: true }]  // For future multi-building support
}, { timestamps: true });

module.exports = mongoose.model('Landlord', landlordSchema);
