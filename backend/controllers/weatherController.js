const weatherService = require('../services/weatherService');

exports.getCurrentWeather = async (req, res) => {
  try {
    const weather = await weatherService.getCurrentWeather(req.params.locationId);
    if (!weather) {
      return res.status(404).json({ message: 'No weather data found for this location. Try fetching first.' });
    }
    res.status(200).json({ weather });
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.getWeatherHistory = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const records = await weatherService.getWeatherHistory(req.params.locationId, days);
    res.status(200).json({ count: records.length, records });
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.fetchWeather = async (req, res) => {
  try {
    const weather = await weatherService.fetchAndStoreWeather(req.params.locationId);
    res.status(201).json({ message: 'Weather data fetched and stored successfully', weather });
  } catch (err) {
    if (err.message === 'Location not found') {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.fetchAllWeather = async (req, res) => {
  try {
    const results = await weatherService.refreshAllWeather();
    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;
    res.status(200).json({
      message: `Weather refresh complete. ${successCount} succeeded, ${failCount} failed.`,
      total: results.length,
      successCount,
      failCount,
      results,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

exports.getAllLatestWeather = async (req, res) => {
  try {
    const result = await weatherService.getLatestWeatherForAllLocations();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
