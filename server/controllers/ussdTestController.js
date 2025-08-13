const User = require('../models/User');
const Bill = require('../models/Bills');

// Quick USSD test user setup
exports.createUSSDTestUser = async (req, res) => {
  try {
    // Check if test user already exists
    let testUser = await User.findOne({ email: 'ussd@test.com' });
    
    if (testUser) {
      return res.json({
        success: true,
        message: 'USSD test user already exists',
        user: {
          name: testUser.name,
          phone: testUser.primaryPhoneNumber,
          email: testUser.email
        }
      });
    }

    // Create test user
    testUser = new User({
      name: 'USSD Test User',
      email: 'ussd@test.com',
      password: 'password123',
      primaryPhoneNumber: '254711123456',
      nationalID: 'USSD123456',
      role: 'Tenant',
      apartmentName: 'USSD Test Apartment',
      rentAmount: 25000
    });

    await testUser.save();

    // Create a test bill
    const testBill = new Bill({
      tenant: testUser._id,
      landlord: testUser._id, // Using same user as landlord for simplicity
      apartmentName: 'USSD Test Apartment',
      amount: 25000,
      remainingAmount: 25000,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      month: 'January',
      year: 2025,
      description: 'Test rent for USSD functionality',
      status: 'Pending'
    });

    await testBill.save();

    res.json({
      success: true,
      message: 'USSD test user created successfully',
      user: {
        name: testUser.name,
        phone: testUser.primaryPhoneNumber,
        email: testUser.email
      },
      instructions: {
        step1: 'Configure Africa\'s Talking webhook URL: https://safe-stay-backend.onrender.com/api/ussd/callback',
        step2: 'Test USSD with phone number: +254711123456',
        step3: 'Use USSD code: *384*70943#'
      }
    });

  } catch (error) {
    console.error('Error creating USSD test user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create USSD test user',
      details: error.message
    });
  }
};

// Check USSD test setup status
exports.getUSSDTestStatus = async (req, res) => {
  try {
    const testUser = await User.findOne({ email: 'ussd@test.com' });
    const testBills = await Bill.countDocuments({ 
      apartmentName: 'USSD Test Apartment' 
    });

    res.json({
      success: true,
      isSetup: !!testUser,
      user: testUser ? {
        name: testUser.name,
        phone: testUser.primaryPhoneNumber,
        email: testUser.email
      } : null,
      billsCount: testBills,
      webhookURL: 'https://safe-stay-backend.onrender.com/api/ussd/callback',
      ussdCode: process.env.USSD_CODE || '*384*70943#'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check USSD test status'
    });
  }
};
