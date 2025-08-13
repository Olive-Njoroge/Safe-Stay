const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Bill = require('../models/Bills');
const Apartment = require('../models/Apartment');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

async function createTestData() {
  try {
    console.log('🔧 Creating test data for USSD testing...');

    // Create test apartment
    const apartment = new Apartment({
      name: 'Test Apartment A',
      location: 'Nairobi, Kenya',
      totalUnits: 10,
      rentAmount: 25000,
      description: 'Test apartment for USSD functionality'
    });
    await apartment.save();
    console.log('✅ Test apartment created');

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
    console.log('✅ Test landlord created');

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
      apartmentId: apartment._id,
      dateMovedIn: new Date('2024-01-01'),
      rentAmount: 25000
    });
    await tenant.save();
    console.log('✅ Test tenant created');

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
      },
      {
        tenant: tenant._id,
        landlord: landlord._id,
        apartmentName: 'Test Apartment A',
        amount: 25000,
        paidAmount: 25000,
        remainingAmount: 0,
        dueDate: new Date('2024-11-30'),
        month: 'November',
        year: 2024,
        description: 'Monthly rent for November 2024',
        status: 'Paid',
        paymentDate: new Date('2024-11-25'),
        paymentHistory: [{
          amount: 25000,
          date: new Date('2024-11-25'),
          method: 'M-Pesa'
        }]
      }
    ];

    for (const billData of bills) {
      const bill = new Bill(billData);
      await bill.save();
    }
    console.log('✅ Test bills created');

    console.log('\n🎉 Test data created successfully!');
    console.log('\nTest Credentials:');
    console.log('Tenant Phone: +254711123456');
    console.log('Landlord Phone: +254722123456');
    console.log('Alt Tenant Phone: +254733123456');
    console.log('\nBills Summary:');
    console.log('- January 2025: KSh 25,000 (Pending)');
    console.log('- December 2024: KSh 10,000 remaining (Partial)');
    console.log('- November 2024: KSh 0 (Paid)');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating test data:', error);
    process.exit(1);
  }
}

// Clear existing test data first
async function clearTestData() {
  try {
    await User.deleteMany({ email: { $regex: '@test.com$' } });
    await Bill.deleteMany({ apartmentName: 'Test Apartment A' });
    await Apartment.deleteMany({ name: 'Test Apartment A' });
    console.log('🧹 Cleared existing test data');
  } catch (error) {
    console.log('No existing test data to clear');
  }
}

// Run the script
async function main() {
  await clearTestData();
  await createTestData();
}

main();
