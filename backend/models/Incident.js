const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  reporterName: {
    type: String,
    trim: true,
    default: 'Anonymous',
  },
  location: {
    type: String,
    required: [true, 'Incident location is required'],
    trim: true,
  },
  locationRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
  },
  waterColor: {
    type: String,
    enum: ['Clear', 'Cloudy', 'Yellow/Brown', 'Green/Algal', 'Red/Rust'],
    default: 'Clear',
  },
  description: {
    type: String,
    required: [true, 'Incident description is required'],
    trim: true,
  },
  photo: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'resolved', 'dismissed'],
    default: 'pending',
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
}, { timestamps: true });

incidentSchema.index({ status: 1, createdAt: -1 });
incidentSchema.index({ severity: 1, status: 1 });
incidentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Incident', incidentSchema);
