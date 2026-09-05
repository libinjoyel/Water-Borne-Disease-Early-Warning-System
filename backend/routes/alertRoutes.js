const express = require('express');
const router = express.Router();
const {
  getAlerts,
  getAlertSummary,
  markAsRead,
  markAsResolved,
  resolveLocationAlerts,
} = require('../controllers/alertController');
const auth = require('../middleware/auth');

router.get('/', getAlerts);
router.get('/summary', getAlertSummary);
router.patch('/:id/read', auth, markAsRead);
router.patch('/:id/resolve', auth, markAsResolved);
router.patch('/resolve-location/:locationId', auth, resolveLocationAlerts);

module.exports = router;
