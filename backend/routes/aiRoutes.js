const express = require('express');
const router = express.Router();
const { analyzePdf, predictRisk } = require('../controllers/aiController');
const { uploadPdf } = require('../middleware/upload');

router.post('/analyze', uploadPdf, (req, res) => analyzePdf(req, res).catch(err => {
  console.error('PDF analyze unhandled:', err);
  if (req.file && req.file.path) {
    require('fs').unlink(req.file.path, () => {});
  }
  const status = Number(err.status) || 500;
  if (!res.headersSent) {
    return res.status(status).json({ error: err.message || 'Failed to analyze PDF.' });
  }
}));

router.post('/predict', (req, res) => predictRisk(req, res).catch(err => {
  console.error('Risk predict unhandled:', err);
  const status = Number(err.status) || 500;
  if (!res.headersSent) {
    return res.status(status).json({ error: err.message || 'Failed to generate risk prediction.' });
  }
}));

module.exports = router;
