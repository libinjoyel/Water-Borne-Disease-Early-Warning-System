const Incident = require('../models/Incident');

exports.createIncident = async (req, res) => {
  try {
    const { reporterName, location, waterColor, description } = req.body;

    if (!location || !description) {
      return res.status(400).json({ message: 'Location and description are required.' });
    }

    const incidentData = {
      reporterName: reporterName || 'Anonymous',
      location,
      waterColor: waterColor || 'Clear',
      description,
    };

    const incident = await Incident.create(incidentData);
    res.status(201).json({ message: 'Incident reported successfully', incident });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.getIncidents = async (req, res) => {
  try {
    const { status, severity, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [incidents, total] = await Promise.all([
      Incident.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Math.min(parseInt(limit), 100))
        .lean(),
      Incident.countDocuments(filter),
    ]);

    res.status(200).json({
      incidents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id).lean();
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    res.status(200).json({ incident });
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
