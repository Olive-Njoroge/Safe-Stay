const express = require('express');
const { 
  generateBill, 
  getBillsByTenant, 
  markBillAsPaid, 
  getAllBills 
} = require('../controllers/billsController');

const router = express.Router();

// @route   POST /api/bills/generate
// @desc    Generate a new bill (landlord creates or system auto-generates)
// @access  Public for now (will restrict later)
router.post('/generate', generateBill);

// @route   GET /api/bills
// @desc    Get all bills (for landlord or admin to view everything)
// @access  Public for now (will restrict later)
router.get('/', getAllBills);

// @route   GET /api/bills/:tenantId
// @desc    Get all bills for a specific tenant
// @access  Public for now (will restrict later)
router.get('/:tenantId', getBillsByTenant);

// @route   PUT /api/bills/:billId/pay
// @desc    Mark a specific bill as Paid (manual or automatic confirmation)
// @access  Public for now (will restrict later)
router.put('/:billId/pay', markBillAsPaid);

module.exports = router;
