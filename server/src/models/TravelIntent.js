const mongoose = require('mongoose');

const travelIntentSchema = new mongoose.Schema(
  {
    user: {
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
    sourceCoordinates: {
      longitude: { type: Number },
      latitude: { type: Number }
    },
    destinationCoordinates: {
      longitude: { type: Number },
      latitude: { type: Number }
    },
    dateTime: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

travelIntentSchema.index({ sourceCoordinates: '2dsphere' });
travelIntentSchema.index({ destinationCoordinates: '2dsphere' });

module.exports = mongoose.model('TravelIntent', travelIntentSchema);
