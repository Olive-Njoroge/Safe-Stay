const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    description: { type: String, trim: true },
    status: {type: String, enum: ['Pending', 'Paid'], default: 'Pending'},
    paymentDate: { type: Date },
    paymentMethod: {type: String, enum: ['M-Pesa', 'PayPal', 'Cash', 'Other'], default: 'Other'}
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bill', billSchema);
