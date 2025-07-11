const Landlord = require('../models/Landlord');

// Create landlord (only if one doesn't exist)
exports.createLandlord = async (req, res) => {
  try {
    const existing = await Landlord.findOne();
    if (existing) return res.status(400).json({ message: 'Landlord profile already exists' });

    const landlord = await Landlord.create(req.body);
    res.status(201).json(landlord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get landlord profile
exports.getLandlord = async (req, res) => {
  try {
    const landlord = await Landlord.findOne();
    if (!landlord) return res.status(404).json({ message: 'Landlord profile not found' });

    res.status(200).json(landlord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update landlord profile
exports.updateLandlord = async (req, res) => {
  try {
    const landlord = await Landlord.findOneAndUpdate({}, req.body, { new: true });
    if (!landlord) return res.status(404).json({ message: 'Landlord profile not found' });

    res.status(200).json(landlord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete landlord profile
exports.deleteLandlord = async (req, res) => {
  try {
    const landlord = await Landlord.findOneAndDelete();
    if (!landlord) return res.status(404).json({ message: 'Landlord profile not found' });

    res.status(200).json({ message: 'Landlord profile deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
