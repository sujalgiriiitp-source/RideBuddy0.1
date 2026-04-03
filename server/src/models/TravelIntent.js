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
    dateTime: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('TravelIntent', travelIntentSchema);
