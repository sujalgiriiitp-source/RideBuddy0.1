const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    pickup: {
      type: String,
      required: true,
      trim: true
    },
    drop: {
      type: String,
      required: true,
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'completed'],
      default: 'pending'
    },
    lastLocation: {
      latitude: {
        type: Number,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180
      },
      heading: {
        type: Number,
        min: 0,
        max: 360
      },
      speed: {
        type: Number,
        min: 0
      },
      updatedAt: {
        type: Date
      }
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    source: {
      type: String,
      required: true,
      trim: true
    },
    destination: {
      type: String,
      required: true,
      trim: true
    },
    dateTime: {
      type: Date,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    seatsAvailable: {
      type: Number,
      required: true,
      min: 1
    },
    passengers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

rideSchema.index({ user: 1, status: 1, createdAt: -1 });
rideSchema.index({ driver: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Ride', rideSchema);
