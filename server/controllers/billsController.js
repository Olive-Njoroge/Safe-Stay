const Bill = require('../models/Bills');
const Tenant = require('../models/Tenant');

// Generate a new bill (landlord creates it or system auto-generates)
exports.generateBill = async (req, res) => {
  const { tenantId, amount, dueDate, description } = req.body;

  try {
    // Check if tenant exists
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    const newBill = await Bill.create({
      tenant: tenantId,
      amount,
      dueDate,
      description
    });

    res.status(201).json(newBill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all bills for a tenant
exports.getBillsByTenant = async (req, res) => {
  const { tenantId } = req.params;

  try {
    const bills = await Bill.find({ tenant: tenantId }).populate('tenant', 'name nationalID') .sort({ dueDate: -1 });
    res.status(200).json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all bills (for landlord or admin to view everything)
exports.getAllBills = async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate('tenant', 'name nationalID')
      .sort({ createdAt: -1 });

    res.status(200).json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark a bill as Paid (manual confirmation or auto after payment)
exports.markBillAsPaid = async (req, res) => {
  const { billId } = req.params;
  const { paymentMethod } = req.body;

  try {
    const updatedBill = await Bill.findByIdAndUpdate(
      billId,
      {
        status: 'Paid',
        paymentDate: new Date(),
        paymentMethod
      },
      { new: true }
    );

    if (!updatedBill) return res.status(404).json({ message: 'Bill not found' });

    res.status(200).json(updatedBill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
