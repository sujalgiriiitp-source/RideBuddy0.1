const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'location', 'system'],
      default: 'text',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    metadata: {
      // For image messages
      imageUrl: String,
      thumbnailUrl: String,
      width: Number,
      height: Number,
      
      // For location messages
      latitude: Number,
      longitude: Number,
      address: String,
      
      // For system messages
      systemType: String, // 'ride_started', 'ride_completed', 'user_joined', etc.
      data: mongoose.Schema.Types.Mixed
    },
    readBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        readAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    deleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Indexes for efficient queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ 'readBy.userId': 1 });

// Virtual for checking if message is read by specific user
messageSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(read => read.userId.toString() === userId.toString());
};

// Mark message as read by user
messageSchema.methods.markAsRead = async function(userId) {
  if (!this.isReadBy(userId)) {
    this.readBy.push({ userId, readAt: new Date() });
    await this.save();
  }
  return this;
};

module.exports = mongoose.model('Message', messageSchema);
