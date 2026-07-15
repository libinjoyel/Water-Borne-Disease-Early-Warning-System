const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
    index: true,
  },
  temperature: {
    type: Number,
    required: [true, 'Temperature is required'],
  },
  feelsLike: {
    type: Number,
  },
  humidity: {
    type: Number,
    required: [true, 'Humidity is required'],
    min: 0,
    max: 100,
  },
  rainfall: {
    type: Number,
    default: 0,
    min: 0,
  },
  pressure: {
    type: Number,
  },
  windSpeed: {
    type: Number,
  },
  windDeg: {
    type: Number,
  },
  weatherCondition: {
    type: String,
    trim: true,
  },
  weatherDescription: {
    type: String,
    trim: true,
  },
  weatherIcon: {
    type: String,
  },
  cloudiness: {
    type: Number,
    min: 0,
    max: 100,
  },
  visibility: {
    type: Number,
  },
  source: {
    type: String,
    enum: ['api', 'manual', 'simulated'],
    default: 'api',
  },
  recordedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
}, { timestamps: true });

weatherSchema.index({ location: 1, recordedAt: -1 });
weatherSchema.index({ recordedAt: -1 });
weatherSchema.index({ location: 1, source: 1, recordedAt: -1 });

module.exports = mongoose.model('Weather', weatherSchema);
