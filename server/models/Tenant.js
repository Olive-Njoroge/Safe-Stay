const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    nationalID: { type: String, unique: true, required: true, trim: true },
    primaryPhoneNumber: { type: String, required: true, trim: true },
    secondaryPhoneNumber: { type: String, trim: true, default: null },
    dateMovedIn: { type: Date, default: Date.now },
    bills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bill' }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tenant', tenantSchema);
