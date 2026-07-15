const Alert = require('../models/Alert');
const Location = require('../models/Location');

const RISK_THRESHOLDS = {
  'High': { severity: 'warning', title: 'Elevated Risk Detected' },
  'Very High': { severity: 'critical', title: 'Critical Risk Alert' },
};

async function generateAlert(locationId, risk) {
  const threshold = RISK_THRESHOLDS[risk.level];
  if (!threshold) return null;

  const existing = await Alert.findOne({
    location: locationId,
    riskLevel: risk.level,
    isResolved: false,
  })
    .sort({ createdAt: -1 })
    .lean();

  if (existing) return existing;

  const location = await Location.findById(locationId).lean();

  const alertData = {
    location: locationId,
    riskScore: risk.score,
    riskLevel: risk.level,
    severity: threshold.severity,
    type: 'risk_threshold',
    title: threshold.title,
    message: `${location.name} (${location.district}) has reached a ${risk.level.toLowerCase()} risk level (${risk.score}/100). ${risk.level === 'Very High' ? 'Immediate action required.' : 'Increased monitoring recommended.'}`,
    recommendation: getRecommendation(risk.level, risk.factors),
    triggeredBy: {
      temperature: risk.factors.temperature.value,
      humidity: risk.factors.humidity.value,
      rainfall: risk.factors.rainfall.value,
    },
  };

  return await Alert.create(alertData);
}

function getRecommendation(level, factors) {
  const recs = [];

  if (factors.rainfall.score >= 20) {
    recs.push('Increased rainfall may cause flooding and water source contamination. Ensure drainage systems are clear.');
  }
  if (factors.temperature.score >= 20) {
    recs.push('Warm temperatures are favorable for pathogen growth. Increase water quality testing frequency.');
  }
  if (factors.humidity.score >= 20) {
    recs.push('High humidity supports pathogen survival. Advise communities to boil drinking water.');
  }

  if (level === 'Very High') {
    recs.push('CRITICAL: Deploy emergency water purification units. Issue public health advisory immediately.');
  } else if (level === 'High') {
    recs.push('Deploy chlorine tablets to affected area. Increase surveillance of waterborne disease cases.');
  }

  return recs.length > 0 ? recs.join(' ') : 'Continue standard monitoring protocols.';
}

async function getAlerts({ locationId, severity, isResolved, isRead, page = 1, limit = 20 }) {
  const filter = {};

  if (locationId) filter.location = locationId;
  if (severity) filter.severity = severity;
  if (isResolved !== undefined) filter.isResolved = isResolved;
  if (isRead !== undefined) filter.isRead = isRead;

  const skip = (page - 1) * limit;

  const [alerts, total] = await Promise.all([
    Alert.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('location', 'name district type coordinates')
      .lean(),
    Alert.countDocuments(filter),
  ]);

  return {
    alerts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

async function markAsRead(alertId) {
  const alert = await Alert.findByIdAndUpdate(
    alertId,
    { isRead: true },
    { new: true }
  ).lean();
  return alert;
}

async function markAsResolved(alertId, resolvedBy) {
  const alert = await Alert.findByIdAndUpdate(
    alertId,
    {
      isResolved: true,
      resolvedAt: new Date(),
      ...(resolvedBy && { resolvedBy }),
    },
    { new: true }
  ).lean();
  return alert;
}

async function resolveAlertsForLocation(locationId) {
  const result = await Alert.updateMany(
    { location: locationId, isResolved: false },
    {
      isResolved: true,
      resolvedAt: new Date(),
    }
  );
  return result;
}

async function getAlertSummary() {
  const [total, unread, unresolved, critical, warning] = await Promise.all([
    Alert.countDocuments({}),
    Alert.countDocuments({ isRead: false }),
    Alert.countDocuments({ isResolved: false }),
    Alert.countDocuments({ severity: 'critical', isResolved: false }),
    Alert.countDocuments({ severity: 'warning', isResolved: false }),
  ]);

  return { total, unread, unresolved, critical, warning };
}

module.exports = {
  generateAlert,
  getAlerts,
  markAsRead,
  markAsResolved,
  resolveAlertsForLocation,
  getAlertSummary,
};
