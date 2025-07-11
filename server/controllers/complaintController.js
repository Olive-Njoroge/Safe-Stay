const Complaint = require('../models/Complaint');
const Tenant = require('../models/Tenant');

// @desc    Submit a new complaint (Tenant)
// @route   POST /api/complaints
exports.createComplaint = async (req, res) => {
  const { tenantId, title, description } = req.body;

  try {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    const complaint = await Complaint.create({
      tenant: tenantId,
      title,
      description
    });

    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all complaints (Landlord/Admin)
// @route   GET /api/complaints
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('tenant', 'name nationalID')
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get complaints by Tenant ID
// @route   GET /api/complaints/tenant/:tenantId
exports.getComplaintsByTenant = async (req, res) => {
  try {
    const complaints = await Complaint.find({ tenant: req.params.tenantId })
      .populate('tenant', 'name nationalID')
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update complaint status (Landlord updates to Resolved/In Progress)
// @route   PUT /api/complaints/:complaintId
exports.updateComplaintStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.complaintId,
      { 
        status, 
        resolvedAt: status === 'Resolved' ? new Date() : null 
      },
      { new: true }
    ).populate('tenant', 'name nationalID');

    if (!updatedComplaint) return res.status(404).json({ message: 'Complaint not found' });

    res.status(200).json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
