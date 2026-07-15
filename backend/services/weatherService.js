const axios = require('axios');
const Location = require('../models/Location');
const Weather = require('../models/Weather');

const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';

function getApiKey() {
  const key = process.env.WEATHER_API_KEY;
  if (!key || key === 'your_openweathermap_api_key') {
    return null;
  }
  return key;
}

async function fetchCurrentWeather(lat, lng) {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  try {
    const { data } = await axios.get(`${WEATHER_API_BASE}/weather`, {
      params: { lat, lon: lng, appid: apiKey, units: 'metric' },
      timeout: 5000,
    });

    return {
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      rainfall: data.rain ? (data.rain['1h'] || data.rain['3h'] || 0) : 0,
      windSpeed: data.wind.speed,
      windDeg: data.wind.deg,
      weatherCondition: data.weather[0].main,
      weatherDescription: data.weather[0].description,
      weatherIcon: data.weather[0].icon,
      cloudiness: data.clouds.all,
      visibility: data.visibility,
      recordedAt: new Date(data.dt * 1000),
    };
  } catch (err) {
    console.error(`Weather API fetch error for [${lat},${lng}]:`, err.message);
    return null;
  }
}

async function fetchAndStoreWeather(locationId) {
  const location = await Location.findById(locationId).select('coordinates name').lean();
  if (!location) throw new Error('Location not found');

  const weatherData = await fetchCurrentWeather(
    location.coordinates.lat,
    location.coordinates.lng
  );

  if (!weatherData) {
    return generateSimulatedWeather(locationId);
  }

  return (await Weather.create({
    location: locationId,
    ...weatherData,
    source: 'api',
  })).toObject();
}

function generateSimulatedWeather(locationId) {
  const baseTemp = 28 + Math.sin(Date.now() / 3600000) * 5;
  const tempVariation = (Math.random() - 0.5) * 6;

  const conditions = ['Clear', 'Clouds', 'Rain', 'Mist', 'Haze'];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];

  const simulatedData = {
    location: locationId,
    temperature: parseFloat((baseTemp + tempVariation).toFixed(1)),
    feelsLike: parseFloat((baseTemp + tempVariation + 2).toFixed(1)),
    humidity: Math.round(60 + Math.random() * 30),
    rainfall: Math.round(Math.random() * 200),
    pressure: 1010 + Math.round(Math.random() * 10),
    windSpeed: parseFloat((2 + Math.random() * 8).toFixed(1)),
    windDeg: Math.round(Math.random() * 360),
    weatherCondition: condition,
    weatherDescription: `Simulated ${condition.toLowerCase()}`,
    weatherIcon: '01d',
    cloudiness: Math.round(Math.random() * 100),
    visibility: 5000 + Math.round(Math.random() * 5000),
    source: 'simulated',
    recordedAt: new Date(),
  };

  return Weather.create(simulatedData);
}

async function getCurrentWeather(locationId) {
  return Weather.findOne({ location: locationId })
    .sort({ recordedAt: -1 })
    .select('temperature humidity rainfall weatherCondition weatherDescription weatherIcon windSpeed pressure recordedAt')
    .populate('location', 'name district coordinates')
    .lean();
}

async function getWeatherHistory(locationId, days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return Weather.find({
    location: locationId,
    recordedAt: { $gte: since },
  })
    .sort({ recordedAt: -1 })
    .select('temperature humidity rainfall weatherCondition pressure windSpeed recordedAt')
    .lean();
}

async function getLatestWeatherForAllLocations() {
  const latestWeathers = await Weather.aggregate([
    { $sort: { recordedAt: -1 } },
    { $group: { _id: '$location', doc: { $first: '$$ROOT' } } },
    { $replaceRoot: { newRoot: '$doc' } },
    {
      $lookup: {
        from: 'locations',
        localField: 'location',
        foreignField: '_id',
        as: 'locationInfo',
      },
    },
    { $unwind: '$locationInfo' },
    {
      $project: {
        'location': { _id: '$locationInfo._id', name: '$locationInfo.name', district: '$locationInfo.district', coordinates: '$locationInfo.coordinates' },
        temperature: 1,
        humidity: 1,
        rainfall: 1,
        weatherCondition: 1,
        windSpeed: 1,
        pressure: 1,
        recordedAt: 1,
      },
    },
  ]);

  return { count: latestWeathers.length, data: latestWeathers };
}

async function refreshAllWeather() {
  const locations = await Location.find({ isActive: true }).select('_id name').lean();
  const results = [];

  for (const loc of locations) {
    try {
      const weather = await fetchAndStoreWeather(loc._id);
      results.push({ location: loc.name, success: true, weather });
    } catch (err) {
      results.push({ location: loc.name, success: false, error: err.message });
    }
  }

  return results;
}

module.exports = {
  fetchCurrentWeather,
  fetchAndStoreWeather,
  generateSimulatedWeather,
  getCurrentWeather,
  getWeatherHistory,
  getLatestWeatherForAllLocations,
  refreshAllWeather,
};
