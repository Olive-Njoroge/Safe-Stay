const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // ✅ fixed ref here
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Resolved'],  // ✅ simplified and matched to your controller default
    default: 'Pending'  // ✅ must match your controller default
  },
  submittedAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
