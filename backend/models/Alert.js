const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
  },
  riskScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Moderate', 'High', 'Very High'],
    required: true,
  },
  type: {
    type: String,
    enum: ['weather', 'risk_threshold', 'outbreak', 'manual'],
    default: 'risk_threshold',
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'warning',
  },
  title: {
    type: String,
    required: [true, 'Alert title is required'],
    trim: true,
  },
  message: {
    type: String,
    required: [true, 'Alert message is required'],
    trim: true,
  },
  recommendation: {
    type: String,
    trim: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  isResolved: {
    type: Boolean,
    default: false,
  },
  resolvedAt: {
    type: Date,
  },
  resolvedBy: {
    type: String,
    trim: true,
  },
  triggeredBy: {
    temperature: Number,
    humidity: Number,
    rainfall: Number,
  },
}, { timestamps: true });

alertSchema.index({ location: 1, createdAt: -1 });
alertSchema.index({ riskLevel: 1, createdAt: -1 });
alertSchema.index({ isResolved: 1, createdAt: -1 });
alertSchema.index({ severity: 1, isRead: 1 });

module.exports = mongoose.model('Alert', alertSchema);
