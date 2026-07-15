const Location = require('../models/Location');
const Weather = require('../models/Weather');
const RiskHistory = require('../models/RiskHistory');
const alertService = require('./alertService');

const TEMP_THRESHOLDS = [
  { max: 15, score: 0 },
  { max: 20, score: 10 },
  { max: 25, score: 20 },
  { max: 32, score: 35 },
  { max: 38, score: 40 },
  { max: Infinity, score: 25 },
];

const HUMIDITY_THRESHOLDS = [
  { max: 50, score: 0 },
  { max: 65, score: 10 },
  { max: 80, score: 20 },
  { max: 90, score: 30 },
  { max: Infinity, score: 35 },
];

const RAINFALL_THRESHOLDS = [
  { max: 50, score: 0 },
  { max: 100, score: 10 },
  { max: 150, score: 20 },
  { max: 250, score: 30 },
  { max: Infinity, score: 35 },
];

function scoreFromThresholds(value, thresholds) {
  for (const t of thresholds) {
    if (value < t.max) return t.score;
  }
  return thresholds[thresholds.length - 1].score;
}

function calculateRiskFromWeather(weatherData) {
  const { temperature, humidity, rainfall } = weatherData;

  const tempScore = scoreFromThresholds(temperature, TEMP_THRESHOLDS);
  const humidityScore = scoreFromThresholds(humidity, HUMIDITY_THRESHOLDS);
  const rainfallScore = scoreFromThresholds(rainfall, RAINFALL_THRESHOLDS);

  const rawScore = tempScore + humidityScore + rainfallScore;
  const normalizedScore = Math.min(100, Math.round((rawScore / 110) * 100));

  let level;
  if (normalizedScore <= 20) level = 'Low';
  else if (normalizedScore <= 45) level = 'Moderate';
  else if (normalizedScore <= 70) level = 'High';
  else level = 'Very High';

  return {
    score: normalizedScore,
    level,
    factors: {
      temperature: { value: temperature, score: tempScore },
      humidity: { value: humidity, score: humidityScore },
      rainfall: { value: rainfall, score: rainfallScore },
    },
  };
}

async function storeRiskHistory(locationId, weatherId, risk, source = 'automatic') {
  return RiskHistory.create({
    location: locationId,
    weather: weatherId,
    riskScore: risk.score,
    riskLevel: risk.level,
    factors: risk.factors,
    source,
    calculatedAt: new Date(),
  });
}

async function calculateRiskForLocation(locationId) {
  const [location, latestWeather] = await Promise.all([
    Location.findById(locationId).lean(),
    Weather.findOne({ location: locationId })
      .sort({ recordedAt: -1 })
      .lean(),
  ]);

  if (!location) throw new Error('Location not found');

  if (!latestWeather) {
    return {
      location: { name: location.name, district: location.district },
      risk: null,
      message: 'No weather data available for this location. Fetch weather data first.',
    };
  }

  const risk = calculateRiskFromWeather({
    temperature: latestWeather.temperature,
    humidity: latestWeather.humidity,
    rainfall: latestWeather.rainfall,
  });

  await Promise.all([
    storeRiskHistory(locationId, latestWeather._id, risk),
    alertService.generateAlert(locationId, risk),
  ]);

  return {
    location: {
      id: location._id,
      name: location.name,
      district: location.district,
      coordinates: location.coordinates,
    },
    weather: {
      id: latestWeather._id,
      temperature: latestWeather.temperature,
      humidity: latestWeather.humidity,
      rainfall: latestWeather.rainfall,
      condition: latestWeather.weatherCondition,
      recordedAt: latestWeather.recordedAt,
    },
    risk,
  };
}

async function calculateRiskFromInput(data) {
  const { temperature, humidity, rainfall } = data;

  if (temperature === undefined || humidity === undefined || rainfall === undefined) {
    throw new Error('temperature, humidity, and rainfall are required');
  }

  return calculateRiskFromWeather({
    temperature: Number(temperature),
    humidity: Number(humidity),
    rainfall: Number(rainfall),
  });
}

async function getRiskOverview() {
  const [locations, latestWeathers] = await Promise.all([
    Location.find({ isActive: true }).select('name district coordinates type').lean(),
    Weather.aggregate([
      { $sort: { recordedAt: -1 } },
      { $group: { _id: '$location', doc: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$doc' } },
      { $project: { temperature: 1, humidity: 1, rainfall: 1, weatherCondition: 1, recordedAt: 1, location: 1 } },
    ]),
  ]);

  const weatherMap = new Map();
  for (const w of latestWeathers) {
    weatherMap.set(w.location.toString(), w);
  }

  let highCount = 0, moderateCount = 0, lowCount = 0;
  let totalScore = 0, dataCount = 0;
  const details = [];

  for (const loc of locations) {
    const locId = loc._id.toString();
    const w = weatherMap.get(locId);

    if (w) {
      const risk = calculateRiskFromWeather({
        temperature: w.temperature,
        humidity: w.humidity,
        rainfall: w.rainfall,
      });

      if (risk.level === 'High' || risk.level === 'Very High') highCount++;
      else if (risk.level === 'Moderate') moderateCount++;
      else lowCount++;

      totalScore += risk.score;
      dataCount++;

      details.push({
        location: {
          id: loc._id,
          name: loc.name,
          district: loc.district,
          coordinates: loc.coordinates,
        },
        weather: {
          temperature: w.temperature,
          humidity: w.humidity,
          rainfall: w.rainfall,
          recordedAt: w.recordedAt,
        },
        risk,
      });
    } else {
      details.push({
        location: { id: loc._id, name: loc.name, district: loc.district, coordinates: loc.coordinates },
        weather: null,
        risk: null,
      });
    }
  }

  return {
    totalLocations: locations.length,
    locationsWithData: dataCount,
    summary: {
      averageRiskScore: dataCount > 0 ? Math.round(totalScore / dataCount) : 0,
      highRisk: highCount,
      moderateRisk: moderateCount,
      lowRisk: lowCount,
    },
    details,
  };
}

async function getRiskHistory(locationId, { days = 30, limit = 100, page = 1 } = {}) {
  const filter = { location: locationId };

  if (days) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    filter.calculatedAt = { $gte: since };
  }

  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    RiskHistory.find(filter)
      .sort({ calculatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    RiskHistory.countDocuments(filter),
  ]);

  return {
    records,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

async function getRiskHistoryTrend(locationId, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const records = await RiskHistory.aggregate([
    { $match: { location: new (require('mongoose').Types.ObjectId)(locationId), calculatedAt: { $gte: since } } },
    { $sort: { calculatedAt: 1 } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$calculatedAt' } },
        avgScore: { $avg: '$riskScore' },
        maxScore: { $max: '$riskScore' },
        minScore: { $min: '$riskScore' },
        dominantLevel: { $last: '$riskLevel' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: '$_id',
        avgScore: { $round: ['$avgScore', 0] },
        maxScore: 1,
        minScore: 1,
        dominantLevel: 1,
        readings: '$count',
      },
    },
  ]);

  return records;
}

module.exports = {
  calculateRiskFromWeather,
  calculateRiskForLocation,
  calculateRiskFromInput,
  getRiskOverview,
  getRiskHistory,
  getRiskHistoryTrend,
  storeRiskHistory,
};
