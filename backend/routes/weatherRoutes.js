const express = require('express');
const router = express.Router();
const {
  getCurrentWeather,
  getWeatherHistory,
  fetchWeather,
  fetchAllWeather,
  getAllLatestWeather,
} = require('../controllers/weatherController');
const auth = require('../middleware/auth');

router.get('/latest', getAllLatestWeather);
router.get('/:locationId', getCurrentWeather);
router.get('/:locationId/history', getWeatherHistory);
router.post('/fetch/:locationId', auth, fetchWeather);
router.post('/fetch-all', auth, fetchAllWeather);

module.exports = router;
