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
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed'
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    cancelledAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index({ user: 1, ride: 1 }, { unique: true });
bookingSchema.index({ user: 1, status: 1, createdAt: -1 });
bookingSchema.index({ ride: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
