const express = require('express');
const router = express.Router();
const { createIncident, getIncidents, getIncidentById } = require('../controllers/incidentController');

router.get('/', getIncidents);
router.get('/:id', getIncidentById);
router.post('/', createIncident);

module.exports = router;
