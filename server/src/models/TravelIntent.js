const mongoose = require('mongoose');

const travelIntentSchema = new mongoose.Schema(
  {
    userId: {
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
    },
    status: {
      type: String,
      enum: ['open', 'matched', 'expired'],
      default: 'open'
    },
    responses: [
      {
        driverId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        status: {
          type: String,
          enum: ['pending', 'accepted', 'declined'],
          default: 'pending'
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    matchedDriverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      default: null
    }
  },
  {
    timestamps: true
  }
);

travelIntentSchema.index({ sourceCoordinates: '2dsphere' });
travelIntentSchema.index({ destinationCoordinates: '2dsphere' });
travelIntentSchema.index({ userId: 1, createdAt: -1 });
travelIntentSchema.index({ status: 1, dateTime: 1 });

travelIntentSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

travelIntentSchema.set('toJSON', { virtuals: true });
travelIntentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('TravelIntent', travelIntentSchema);
