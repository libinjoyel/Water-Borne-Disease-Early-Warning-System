const mongoose = require('mongoose');

const riskHistorySchema = new mongoose.Schema({
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
  },
  weather: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Weather',
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
  factors: {
    temperature: {
      value: Number,
      score: Number,
    },
    humidity: {
      value: Number,
      score: Number,
    },
    rainfall: {
      value: Number,
      score: Number,
    },
  },
  source: {
    type: String,
    enum: ['automatic', 'manual', 'simulated'],
    default: 'automatic',
  },
  calculatedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
}, { timestamps: true });

riskHistorySchema.index({ location: 1, calculatedAt: -1 });
riskHistorySchema.index({ riskLevel: 1, calculatedAt: -1 });
riskHistorySchema.index({ calculatedAt: -1 });
riskHistorySchema.index({ location: 1, riskLevel: 1, calculatedAt: -1 });

module.exports = mongoose.model('RiskHistory', riskHistorySchema);
