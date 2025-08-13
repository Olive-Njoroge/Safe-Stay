const express = require('express');
const User = require('../models/User');
const Bill = require('../models/Bills');

const router = express.Router();

// Quick test user creation for USSD testing
router.post('/quick-setup', async (req, res) => {
  try {
    console.log('Starting quick setup...');
    
    // Clear existing test data
    await User.deleteMany({ primaryPhoneNumber: '254711123456' });
    await User.deleteMany({ primaryPhoneNumber: '254722123456' });
    console.log('Cleared existing test users');

    // Create simple test tenant (no apartmentId reference)
    const tenant = new User({
      name: 'Test Tenant',
      email: 'quicktest@tenant.com', 
      password: 'password123',
      primaryPhoneNumber: '254711123456',
      secondaryPhoneNumber: '254733123456',
      nationalID: 'TN12345678',
      role: 'Tenant',
      apartmentName: 'Quick Test Building',
      dateMovedIn: new Date('2024-01-01'),
      rentAmount: 25000
    });
    await tenant.save();
    console.log('Created test tenant');

    // Create simple test landlord
    const landlord = new User({
      name: 'Test Landlord',
      email: 'quicktest@landlord.com',
      password: 'password123',
      primaryPhoneNumber: '254722123456',
      nationalID: 'LL12345678',
      role: 'Landlord',
      apartmentName: 'Quick Test Building',
      rentAmount: 25000
    });
    await landlord.save();
    console.log('Created test landlord');

    // Create simple test bills
    const bill1 = new Bill({
      tenant: tenant._id,
      landlord: landlord._id,
      apartmentName: 'Quick Test Building',
      amount: 25000,
      remainingAmount: 25000,
      dueDate: new Date('2025-03-31'),
      month: 'March',
      year: 2025,
      description: 'March 2025 rent',
      status: 'Pending'
    });
    await bill1.save();

    const bill2 = new Bill({
      tenant: tenant._id,
      landlord: landlord._id,
      apartmentName: 'Quick Test Building',
      amount: 25000,
      paidAmount: 15000,
      remainingAmount: 10000,
      dueDate: new Date('2025-02-28'),
      month: 'February',
      year: 2025,
      description: 'February 2025 rent',
      status: 'Partial',
      paymentHistory: [{
        amount: 15000,
        date: new Date('2025-02-15'),
        method: 'M-Pesa'
      }]
    });
    await bill2.save();
    console.log('Created test bills');

    res.json({
      success: true,
      message: '🎉 Quick test setup completed successfully!',
      data: {
        tenant: {
          name: tenant.name,
          phone: tenant.primaryPhoneNumber,
          altPhone: tenant.secondaryPhoneNumber
        },
        landlord: {
          name: landlord.name,
          phone: landlord.primaryPhoneNumber
        },
        billsCreated: 2,
        testInstructions: {
          message: 'Now you can test USSD with these phone numbers:',
          ussdCode: '*384*70943#',
          testPhones: [
            '+254711123456 (tenant primary)',
            '+254733123456 (tenant secondary)',
            '+254722123456 (landlord)'
          ],
          nextStep: 'Try dialing the USSD code with +254711123456'
        }
      }
    });

  } catch (error) {
    console.error('Quick setup error:', error);
    res.status(500).json({
      success: false,
      error: 'Quick setup failed',
      details: error.message,
      stack: error.stack
    });
  }
});

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
