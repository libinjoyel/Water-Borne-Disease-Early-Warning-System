const riskService = require('../services/riskService');

exports.getRiskForLocation = async (req, res) => {
  try {
    const result = await riskService.calculateRiskForLocation(req.params.locationId);
    if (!result.risk) {
      return res.status(200).json(result);
    }
    res.status(200).json(result);
  } catch (err) {
    if (err.message === 'Location not found') {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.calculateRisk = async (req, res) => {
  try {
    const { temperature, humidity, rainfall } = req.body;

    if (temperature === undefined || humidity === undefined || rainfall === undefined) {
      return res.status(400).json({
        message: 'Please provide temperature, humidity, and rainfall values.',
      });
    }

    const risk = await riskService.calculateRiskFromInput({ temperature, humidity, rainfall });
    res.status(200).json(risk);
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.getRiskOverview = async (req, res) => {
  try {
    const overview = await riskService.getRiskOverview();
    res.status(200).json(overview);
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.getLocationRiskHistory = async (req, res) => {
  try {
    const { days, limit, page } = req.query;
    const result = await riskService.getRiskHistory(req.params.locationId, {
      days: days ? parseInt(days) : 30,
      limit: limit ? Math.min(parseInt(limit), 200) : 100,
      page: page ? parseInt(page) : 1,
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.getLocationRiskTrend = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const trend = await riskService.getRiskHistoryTrend(req.params.locationId, days);
    res.status(200).json({ days, trend });
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
