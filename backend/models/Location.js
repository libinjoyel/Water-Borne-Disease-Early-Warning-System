const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Location name is required'],
    trim: true,
  },
  district: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
    default: 'India',
    trim: true,
  },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  type: {
    type: String,
    enum: ['city', 'village', 'district', 'region'],
    default: 'district',
  },
  population: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

locationSchema.index({ coordinates: '2dsphere' });
locationSchema.index({ district: 1, name: 1 });
locationSchema.index({ isActive: 1, name: 1 });
locationSchema.index({ type: 1, district: 1 });

module.exports = mongoose.model('Location', locationSchema);
