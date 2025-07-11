const Complaint = require('../models/Complaint');
const User = require('../models/User');

// 👉 Create a new complaint (Tenant)
exports.createComplaint = async (req, res) => {
  const { tenantId, title, description } = req.body;

  try {
    // Verify that the tenant exists and is actually a tenant
    const tenant = await User.findOne({ _id: tenantId, role: 'Tenant' });
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    const complaint = await Complaint.create({
      tenant: tenantId,
      title,
      description,
      status: 'Pending'  // Default status
    });

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 👉 Get all complaints (Landlord/Admin view)
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('tenant', 'name email nationalID role')  // Get tenant details
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 👉 Get complaints by Tenant ID
exports.getComplaintsByTenant = async (req, res) => {
  const { tenantId } = req.params;

  try {
    const complaints = await Complaint.find({ tenant: tenantId })
      .populate('tenant', 'name email nationalID role')
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 👉 Update complaint status (Landlord updates)
exports.updateComplaintStatus = async (req, res) => {
  const { complaintId } = req.params;
  const { status } = req.body;  // Expected: "Resolved", "In Progress", etc.

  try {
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      complaintId,
      {
        status,
        resolvedAt: status === 'Resolved' ? new Date() : null
      },
      { new: true }
    ).populate('tenant', 'name email nationalID role');

    if (!updatedComplaint) return res.status(404).json({ message: 'Complaint not found' });

    res.status(200).json({
      message: 'Complaint status updated successfully',
      complaint: updatedComplaint
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
