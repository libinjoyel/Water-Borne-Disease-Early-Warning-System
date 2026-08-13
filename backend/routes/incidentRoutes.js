const express = require('express');
const router = express.Router();
const { createIncident, getIncidents, getIncidentById } = require('../controllers/incidentController');
const { uploadIncidentPhoto } = require('../middleware/upload');

router.get('/', getIncidents);
router.get('/:id', getIncidentById);
router.post('/', uploadIncidentPhoto, createIncident);

module.exports = router;
