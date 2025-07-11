const express = require('express');
const {
  generateBill,
  getBillsByTenant,
  markBillAsPaid,
  getAllBills,
  getMyBills
} = require('../controllers/billsController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ✅ Protected: Generate new bill
router.post('/generate', protect, generateBill);

// ✅ Protected: Get logged-in tenant’s bills (MUST come before /:tenantId)
router.get('/me', protect, getMyBills);

// ✅ Protected: Get all bills (Landlord/Admin)
router.get('/', protect, getAllBills);

// ✅ Protected: Get all bills for a specific tenant (Landlord/Admin)
router.get('/:tenantId', protect, getBillsByTenant);

// ✅ Protected: Mark bill as paid
router.put('/:billId/pay', protect, markBillAsPaid);

module.exports = router;
