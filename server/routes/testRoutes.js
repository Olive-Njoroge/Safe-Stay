const express = require('express');
const User = require('../models/User');
const Bill = require('../models/Bills');

const router = express.Router();

// Create test data for USSD testing
router.post('/setup-data', async (req, res) => {
  try {
    // Clear existing test data
    await User.deleteMany({ email: { $regex: '@test.com$' } });
    await Bill.deleteMany({ apartmentName: 'Test Apartment A' });

    // Create test landlord
    const landlord = new User({
      name: 'Jane Smith',
      email: 'landlord@test.com',
      password: 'password123',
      primaryPhoneNumber: '254722123456',
      nationalID: 'LL12345678',
      role: 'Landlord',
      apartmentName: 'Test Apartment A',
      rentAmount: 25000
    });
    await landlord.save();

    // Create test tenant
    const tenant = new User({
      name: 'John Doe',
      email: 'tenant@test.com', 
      password: 'password123',
      primaryPhoneNumber: '254711123456',
      secondaryPhoneNumber: '254733123456',
      nationalID: 'TN12345678',
      role: 'Tenant',
      apartmentName: 'Test Apartment A',
      dateMovedIn: new Date('2024-01-01'),
      rentAmount: 25000
    });
    await tenant.save();

    // Create test bills
    const bills = [
      {
        tenant: tenant._id,
        landlord: landlord._id,
        apartmentName: 'Test Apartment A',
        amount: 25000,
        remainingAmount: 25000,
        dueDate: new Date('2025-01-31'),
        month: 'January',
        year: 2025,
        description: 'Monthly rent for January 2025',
        status: 'Pending'
      },
      {
        tenant: tenant._id,
        landlord: landlord._id,
        apartmentName: 'Test Apartment A',
        amount: 25000,
        paidAmount: 15000,
        remainingAmount: 10000,
        dueDate: new Date('2024-12-31'),
        month: 'December',
        year: 2024,
        description: 'Monthly rent for December 2024',
        status: 'Partial',
        paymentHistory: [{
          amount: 15000,
          date: new Date('2024-12-15'),
          method: 'M-Pesa'
        }]
      }
    ];

    for (const billData of bills) {
      const bill = new Bill(billData);
      await bill.save();
    }

    res.json({
      success: true,
      message: 'Test data created successfully',
      data: {
        landlord: landlord._id,
        tenant: tenant._id,
        billsCreated: bills.length,
        testPhones: [
          '+254711123456 (tenant)',
          '+254722123456 (landlord)',
          '+254733123456 (tenant alt)'
        ]
      }
    });

  } catch (error) {
    console.error('Error creating test data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create test data',
      details: error.message
    });
  }
});

// Get test data status
router.get('/status', async (req, res) => {
  try {
    const testUsers = await User.countDocuments({ email: { $regex: '@test.com$' } });
    const testBills = await Bill.countDocuments({ apartmentName: 'Test Apartment A' });
    const testApartments = await Apartment.countDocuments({ name: 'Test Apartment A' });

    res.json({
      success: true,
      testData: {
        users: testUsers,
        bills: testBills,
        apartments: testApartments,
        isSetup: testUsers > 0 && testBills > 0 && testApartments > 0
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check test data status'
    });
  }
});

module.exports = router;
