const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },

  primaryPhoneNumber: { type: String, required: true },
  secondaryPhoneNumber: { type: String },

  nationalID: { type: String, required: true, unique: true },

  role: { 
    type: String, 
    enum: ['Tenant', 'Landlord'], 
    required: true 
  },

  // Landlord-specific field (optional)
  buildingName: { type: String },

  // Tenant-specific field (optional)
  dateMovedIn: { type: Date },

}, { timestamps: true });

// 🔑 Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔑 Password compare method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
