const mongoose = require('mongoose');

// Optimize database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Connection optimization
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0, // Disable mongoose buffering
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Add database indexes for better performance
    await addIndexes();
    
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

// Add database indexes for faster queries
const addIndexes = async () => {
  try {
    const User = require('../models/User');
    const Bill = require('../models/Bills');
    const Chat = require('../models/Chat');
    const Complaint = require('../models/Complaint');

    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ nationalID: 1 }, { unique: true });
    await User.collection.createIndex({ primaryPhoneNumber: 1 });
    await User.collection.createIndex({ apartmentName: 1 });
    await User.collection.createIndex({ role: 1 });

    // Bill indexes
    await Bill.collection.createIndex({ tenant: 1 });
    await Bill.collection.createIndex({ landlord: 1 });
    await Bill.collection.createIndex({ status: 1 });
    await Bill.collection.createIndex({ dueDate: 1 });
    await Bill.collection.createIndex({ apartmentName: 1 });

    // Chat indexes
    await Chat.collection.createIndex({ participants: 1 });
    await Chat.collection.createIndex({ createdAt: -1 });

    // Complaint indexes
    await Complaint.collection.createIndex({ tenant: 1 });
    await Complaint.collection.createIndex({ status: 1 });
    await Complaint.collection.createIndex({ apartmentName: 1 });

    console.log('📊 Database indexes created successfully');
  } catch (error) {
    console.log('ℹ️ Indexes may already exist:', error.message);
  }
};

module.exports = connectDB;
