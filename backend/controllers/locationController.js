const Location = require('../models/Location');

exports.createLocation = async (req, res) => {
  try {
    const location = await Location.create(req.body);
    res.status(201).json({ message: 'Location created successfully', location });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ count: locations.length, locations });
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.status(200).json({ location });
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.status(200).json({ message: 'Location updated successfully', location });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.status(200).json({ message: 'Location deactivated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.seedLocations = async (req, res) => {
  try {
    const locations = [
      { name: 'District Central', district: 'District Central', coordinates: { lat: 17.3850, lng: 78.4867 }, type: 'district' },
      { name: 'District East', district: 'District East', coordinates: { lat: 17.4000, lng: 78.5500 }, type: 'district' },
      { name: 'District South', district: 'District South', coordinates: { lat: 17.3450, lng: 78.5200 }, type: 'district' },
      { name: 'District West', district: 'District West', coordinates: { lat: 17.4100, lng: 78.4100 }, type: 'district' },
      { name: 'District North', district: 'District North', coordinates: { lat: 17.4500, lng: 78.4600 }, type: 'district' },
      { name: 'Village North-1', district: 'District Central', coordinates: { lat: 17.3950, lng: 78.4800 }, type: 'village' },
      { name: 'Village East-2', district: 'District Central', coordinates: { lat: 17.3900, lng: 78.5000 }, type: 'village' },
      { name: 'Village South-1', district: 'District South', coordinates: { lat: 17.3400, lng: 78.5100 }, type: 'village' },
    ];

    await Location.deleteMany({});
    const created = await Location.insertMany(locations);
    res.status(201).json({ message: 'Locations seeded successfully', count: created.length, locations: created });
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
