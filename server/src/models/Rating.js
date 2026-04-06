const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: true
    },
    raterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    ratedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    stars: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

ratingSchema.index({ rideId: 1, raterId: 1, ratedUserId: 1 }, { unique: true });
ratingSchema.index({ ratedUserId: 1, createdAt: -1 });
ratingSchema.index({ raterId: 1, createdAt: -1 });

module.exports = mongoose.model('Rating', ratingSchema);
