const Tenant = require('../models/Tenant');

// Create a new tenant
exports.createTenant = async (req, res) => {
  const { name, nationalID, primaryPhoneNumber, secondaryPhoneNumber, dateMovedIn } = req.body;

  try {
    const existingTenant = await Tenant.findOne({ nationalID });
    if (existingTenant) {
      return res.status(400).json({ message: 'Tenant with this National ID already exists.' });
    }

    const tenant = await Tenant.create({
      name,
      nationalID,
      primaryPhoneNumber,
      secondaryPhoneNumber,
      dateMovedIn
    });

    res.status(201).json(tenant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all tenants
exports.getAllTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find().sort({ createdAt: -1 });
    res.status(200).json(tenants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single tenant by ID
exports.getTenantById = async (req, res) => {
  const { tenantId } = req.params;

  try {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    res.status(200).json(tenant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update tenant information
exports.updateTenant = async (req, res) => {
  const { tenantId } = req.params;
  const updates = req.body;

  try {
    const tenant = await Tenant.findByIdAndUpdate(tenantId, updates, { new: true });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    res.status(200).json(tenant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a tenant
exports.deleteTenant = async (req, res) => {
  const { tenantId } = req.params;

  try {
    const tenant = await Tenant.findByIdAndDelete(tenantId);

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    res.status(200).json({ message: 'Tenant deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
