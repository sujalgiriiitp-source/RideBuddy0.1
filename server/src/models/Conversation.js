const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: true
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    ],
    lastMessage: {
      text: {
        type: String,
        default: ''
      },
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      messageType: {
        type: String,
        enum: ['text', 'image', 'location', 'system'],
        default: 'text'
      }
    }
  },
  {
    timestamps: true
  }
);

// Indexes for efficient queries
conversationSchema.index({ rideId: 1 });
conversationSchema.index({ participants: 1 });
conversationSchema.index({ 'lastMessage.timestamp': -1 });
conversationSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
