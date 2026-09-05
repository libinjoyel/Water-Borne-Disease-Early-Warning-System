const Location = require('../models/Location');
const Weather = require('../models/Weather');
const RiskHistory = require('../models/RiskHistory');
const Alert = require('../models/Alert');
const Incident = require('../models/Incident');

exports.getSummary = async (req, res) => {
  try {
    const [
      locationCount,
      weatherCount,
      riskSummary,
      alertSummary,
      incidentSummary,
      latestWeathers,
    ] = await Promise.all([
      Location.countDocuments({ isActive: true }),
      Weather.countDocuments({}),
      RiskHistory.aggregate([
        { $sort: { calculatedAt: -1 } },
        { $group: { _id: '$location', doc: { $first: '$$ROOT' } } },
        { $replaceRoot: { newRoot: '$doc' } },
        {
          $group: {
            _id: null,
            avgScore: { $avg: '$riskScore' },
            highRisk: { $sum: { $cond: [{ $in: ['$riskLevel', ['High', 'Very High']] }, 1, 0] } },
            moderateRisk: { $sum: { $cond: [{ $eq: ['$riskLevel', 'Moderate'] }, 1, 0] } },
            lowRisk: { $sum: { $cond: [{ $eq: ['$riskLevel', 'Low'] }, 1, 0] } },
            total: { $sum: 1 },
          },
        },
      ]),
      Alert.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            unresolved: { $sum: { $cond: [{ $eq: ['$isResolved', false] }, 1, 0] } },
            critical: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } },
          },
        },
      ]),
      Incident.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          },
        },
      ]),
      Weather.aggregate([
        { $sort: { recordedAt: -1 } },
        { $group: { _id: '$location', doc: { $first: '$$ROOT' } } },
        { $replaceRoot: { newRoot: '$doc' } },
        {
          $group: {
            _id: null,
            avgTemp: { $avg: '$temperature' },
            avgHumidity: { $avg: '$humidity' },
            avgRainfall: { $avg: '$rainfall' },
          },
        },
      ]),
    ]);

    const riskData = riskSummary[0] || { avgScore: 0, highRisk: 0, moderateRisk: 0, lowRisk: 0, total: 0 };
    const alertData = alertSummary[0] || { total: 0, unresolved: 0, critical: 0 };
    const incidentData = incidentSummary[0] || { total: 0, pending: 0 };
    const weatherData = latestWeathers[0] || { avgTemp: 0, avgHumidity: 0, avgRainfall: 0 };

    res.status(200).json({
      locations: { total: locationCount },
      weather: {
        totalRecords: weatherCount,
        averages: {
          temperature: Math.round(weatherData.avgTemp * 10) / 10,
          humidity: Math.round(weatherData.avgHumidity),
          rainfall: Math.round(weatherData.avgRainfall),
        },
      },
      risk: {
        locationsTracked: riskData.total,
        averageScore: Math.round(riskData.avgScore),
        highRisk: riskData.highRisk,
        moderateRisk: riskData.moderateRisk,
        lowRisk: riskData.lowRisk,
      },
      alerts: {
        total: alertData.total,
        unresolved: alertData.unresolved,
        critical: alertData.critical,
      },
      incidents: {
        total: incidentData.total,
        pending: incidentData.pending,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
