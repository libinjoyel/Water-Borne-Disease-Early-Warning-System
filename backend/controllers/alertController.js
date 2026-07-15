const alertService = require('../services/alertService');

exports.getAlerts = async (req, res) => {
  try {
    const {
      locationId,
      severity,
      isResolved,
      isRead,
      page = 1,
      limit = 20,
    } = req.query;

    const result = await alertService.getAlerts({
      locationId,
      severity,
      isResolved: isResolved !== undefined ? isResolved === 'true' : undefined,
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100),
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.getAlertSummary = async (req, res) => {
  try {
    const summary = await alertService.getAlertSummary();
    res.status(200).json(summary);
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const alert = await alertService.markAsRead(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    res.status(200).json({ message: 'Alert marked as read', alert });
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.markAsResolved = async (req, res) => {
  try {
    const { resolvedBy } = req.body;
    const alert = await alertService.markAsResolved(req.params.id, resolvedBy);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    res.status(200).json({ message: 'Alert resolved', alert });
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.resolveLocationAlerts = async (req, res) => {
  try {
    const result = await alertService.resolveAlertsForLocation(req.params.locationId);
    res.status(200).json({
      message: `Resolved ${result.modifiedCount} active alerts for location.`,
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
