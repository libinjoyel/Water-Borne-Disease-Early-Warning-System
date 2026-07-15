const express = require('express');
const router = express.Router();
const {
  getRiskForLocation,
  calculateRisk,
  getRiskOverview,
  getLocationRiskHistory,
  getLocationRiskTrend,
} = require('../controllers/riskController');

router.get('/overview', getRiskOverview);
router.get('/:locationId', getRiskForLocation);
router.get('/:locationId/history', getLocationRiskHistory);
router.get('/:locationId/trend', getLocationRiskTrend);
router.post('/calculate', calculateRisk);

module.exports = router;
