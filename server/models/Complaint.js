const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  title: { type: String, required: true, trim: true },  // Short headline
  description: { type: String, required: true, trim: true },  // Detailed complaint
  status: { type: String, enum: ['Submitted', 'In Progress', 'Resolved'], default: 'Submitted' },
  submittedAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date }  // Optional: track when it was resolved
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
