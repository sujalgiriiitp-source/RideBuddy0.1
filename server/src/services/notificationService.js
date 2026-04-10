const { Expo } = require('expo-server-sdk');
const NotificationToken = require('../models/NotificationToken');
const Notification = require('../models/Notification');
const User = require('../models/User');
const logger = require('../config/logger');
const { sendMulticastNotification } = require('./fcmService');

const expo = new Expo();

const notificationTemplates = {
  rideCreated: (ride) => ({
    title: '🚗 New Ride Available!',
    body: `${ride.source} → ${ride.destination} | ₹${ride.price}`,
    data: { type: 'ride_created', rideId: ride._id.toString() }
  }),
  rideJoined: ({ source, destination, _id, passenger }) => ({
    title: '✅ Someone joined your ride!',
    body: `${passenger.name} joined your ride to ${destination || source}`,
    data: { type: 'ride_joined', rideId: _id.toString() }
  }),
  rideAccepted: (ride) => ({
    title: '🎉 Ride Confirmed!',
    body: `Your ride to ${ride.destination} has been accepted`,
    data: { type: 'ride_accepted', rideId: ride._id.toString() }
  }),
  rideStarted: (ride) => ({
    title: '🚀 Ride Started!',
    body: `Your ride to ${ride.destination} is now on the way`,
    data: { type: 'ride_started', rideId: ride._id.toString() }
  }),
  rideCompleted: (ride) => ({
    title: '✨ Ride Completed!',
    body: `You've arrived at ${ride.destination}. Rate your experience!`,
    data: { type: 'ride_completed', rideId: ride._id.toString() }
  }),
  rideCancelled: ({ destination, _id, reason }) => ({
    title: '❌ Ride Cancelled',
    body: reason || `Ride to ${destination} has been cancelled`,
    data: { type: 'ride_cancelled', rideId: _id.toString() }
  }),
  intentMatched: ({ intent, ride }) => ({
    title: '🎯 Perfect Match Found!',
    body: `We found a ride matching your intent: ${ride.source} → ${ride.destination}`,
    data: { type: 'intent_matched', intentId: intent._id.toString(), rideId: ride._id.toString() }
  })
};

const normalizeUserIds = (userIds) => {
  if (Array.isArray(userIds)) {
    return userIds.map((id) => String(id));
  }
  return [String(userIds)];
};

class NotificationService {
  static async registerToken(userId, expoPushToken, deviceId, platform, fcmToken) {
    let token = null;

    if (fcmToken && String(fcmToken).trim()) {
      await User.findByIdAndUpdate(userId, { $set: { fcmToken: String(fcmToken).trim() } }, { new: false });
    }

    if (expoPushToken && String(expoPushToken).trim()) {
      if (!Expo.isExpoPushToken(expoPushToken)) {
        throw new Error('Invalid Expo push token');
      }

      if (!deviceId || !platform) {
        throw new Error('deviceId and platform are required when registering Expo push token');
      }

      token = await NotificationToken.findOne({ userId, deviceId });
      if (token) {
        token.expoPushToken = expoPushToken;
        token.platform = platform;
        token.active = true;
        token.lastUsed = Date.now();
        await token.save();
      } else {
        token = await NotificationToken.create({
          userId,
          expoPushToken,
          deviceId,
          platform,
          active: true
        });
      }
    }

    if (!token && (!fcmToken || !String(fcmToken).trim())) {
      throw new Error('At least one token is required');
    }

    return token;
  }

  static async unregisterToken(userId, deviceId) {
    if (!deviceId) {
      throw new Error('deviceId is required');
    }

    return NotificationToken.findOneAndUpdate(
      { userId, deviceId },
      { active: false },
      { new: true }
    );
  }

  static async getUserTokens(userId) {
    return NotificationToken.find({ userId, active: true });
  }

  static async createInAppNotifications(userIds, payload) {
    const ids = normalizeUserIds(userIds);
    if (ids.length === 0) {
      return [];
    }

    const docs = ids.map((userId) => ({
      userId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
      isRead: false
    }));

    return Notification.insertMany(docs);
  }

  static async sendExpoToUsers(userIds, notification) {
    const ids = normalizeUserIds(userIds);
    const tokens = await NotificationToken.find({
      userId: { $in: ids },
      active: true
    }).lean();

    if (tokens.length === 0) {
      return { sent: 0, failed: 0 };
    }

    const messages = tokens.map((token) => ({
      to: token.expoPushToken,
      sound: 'default',
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      priority: 'high',
      channelId: 'ride-updates'
    }));

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }

    const successCount = tickets.filter((ticket) => ticket.status === 'ok').length;
    const errorCount = tickets.filter((ticket) => ticket.status === 'error').length;

    for (let index = 0; index < tickets.length; index += 1) {
      const ticket = tickets[index];
      if (ticket.status !== 'error') {
        continue;
      }

      if (ticket.details?.error === 'DeviceNotRegistered') {
        const token = tokens[index];
        if (token?._id) {
          await NotificationToken.findByIdAndUpdate(token._id, { active: false });
        }
      }
    }

    return { sent: successCount, failed: errorCount };
  }

  static async sendFcmToUsers(userIds, notification) {
    const ids = normalizeUserIds(userIds);
    const users = await User.find({
      _id: { $in: ids },
      fcmToken: { $exists: true, $ne: '' }
    })
      .select('fcmToken')
      .lean();

    const tokens = users.map((user) => user.fcmToken).filter(Boolean);
    const result = await sendMulticastNotification({
      tokens,
      title: notification.title,
      body: notification.body,
      data: notification.data
    });

    logger.info(`FCM dispatch completed: ${result.successCount || 0} success, ${result.failureCount || 0} failed`);
    return result;
  }

  static async sendToUsers(userIds, notification) {
    const [expoResult, fcmResult] = await Promise.all([
      this.sendExpoToUsers(userIds, notification),
      this.sendFcmToUsers(userIds, notification)
    ]);

    return {
      success: true,
      expo: expoResult,
      fcm: {
        successCount: fcmResult?.successCount || 0,
        failureCount: fcmResult?.failureCount || 0
      }
    };
  }

  static async sendTemplateNotification(userIds, templateName, data) {
    const template = notificationTemplates[templateName];
    if (!template) {
      throw new Error(`Unknown notification template: ${templateName}`);
    }

    const notification = template(data);
    return this.sendToUsers(userIds, notification);
  }

  static async cleanupOldTokens(daysOld = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return NotificationToken.deleteMany({
      active: false,
      updatedAt: { $lt: cutoffDate }
    });
  }
}

module.exports = NotificationService;
module.exports.notificationTemplates = notificationTemplates;
