const express = require('express');
const router = express.Router();
const {
  createLocation,
  getAllLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
  seedLocations,
} = require('../controllers/locationController');
const auth = require('../middleware/auth');

router.get('/', getAllLocations);
router.get('/:id', getLocationById);
router.post('/', auth, createLocation);
router.put('/:id', auth, updateLocation);
router.delete('/:id', auth, deleteLocation);
router.post('/seed', auth, seedLocations);

module.exports = router;
