const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
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

module.exports = mongoose.model('Ride', rideSchema);
