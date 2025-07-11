const express = require('express');
const { 
  createComplaint, 
  getAllComplaints, 
  getComplaintsByTenant, 
  updateComplaintStatus 
} = require('../controllers/complaintController');

const router = express.Router();

// @route   POST /api/complaints
// @desc    Submit a new complaint (Tenant)
router.post('/', createComplaint);

// @route   GET /api/complaints
// @desc    Get all complaints (Landlord/Admin)
router.get('/', getAllComplaints);

// @route   GET /api/complaints/tenant/:tenantId
// @desc    Get complaints by specific tenant
router.get('/tenant/:tenantId', getComplaintsByTenant);

// @route   PUT /api/complaints/:complaintId
// @desc    Update complaint status (Landlord updates to In Progress or Resolved)
router.put('/:complaintId', updateComplaintStatus);

module.exports = router;
