const mongoose = require('mongoose');

const notificationTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    expoPushToken: {
      type: String,
      required: true,
      index: true
    },
    deviceId: {
      type: String,
      required: true
    },
    platform: {
      type: String,
      enum: ['ios', 'android', 'web'],
      required: true
    },
    active: {
      type: Boolean,
      default: true,
      index: true
    },
    lastUsed: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound index for efficient lookups
notificationTokenSchema.index({ userId: 1, deviceId: 1 }, { unique: true });
notificationTokenSchema.index({ expoPushToken: 1, active: 1 });

// Update lastUsed on each query
notificationTokenSchema.methods.updateLastUsed = function() {
  this.lastUsed = Date.now();
  return this.save();
};

module.exports = mongoose.model('NotificationToken', notificationTokenSchema);
