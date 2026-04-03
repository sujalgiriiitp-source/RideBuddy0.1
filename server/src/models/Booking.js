const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: true
    },
    seatsBooked: {
      type: Number,
      required: true,
      min: 1
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index({ user: 1, ride: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
