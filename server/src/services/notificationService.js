const { Expo } = require('expo-server-sdk');
const NotificationToken = require('../models/NotificationToken');
const logger = require('../config/logger');

// Create a new Expo SDK client
const expo = new Expo();

/**
 * Notification templates for different ride events
 */
const notificationTemplates = {
  rideCreated: (ride) => ({
    title: '🚗 New Ride Available!',
    body: `${ride.source} → ${ride.destination} | ₹${ride.price}`,
    data: { type: 'ride_created', rideId: ride._id.toString() }
  }),
  
  rideJoined: (ride, passenger) => ({
    title: '✅ Someone joined your ride!',
    body: `${passenger.name} joined your ride to ${ride.destination}`,
    data: { type: 'ride_joined', rideId: ride._id.toString() }
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
  
  rideCancelled: (ride, reason) => ({
    title: '❌ Ride Cancelled',
    body: reason || `Ride to ${ride.destination} has been cancelled`,
    data: { type: 'ride_cancelled', rideId: ride._id.toString() }
  }),
  
  intentMatched: (intent, ride) => ({
    title: '🎯 Perfect Match Found!',
    body: `We found a ride matching your intent: ${ride.source} → ${ride.destination}`,
    data: { type: 'intent_matched', intentId: intent._id.toString(), rideId: ride._id.toString() }
  })
};

class NotificationService {
  /**
   * Register a push notification token for a user
   */
  static async registerToken(userId, expoPushToken, deviceId, platform) {
    try {
      // Validate the Expo push token
      if (!Expo.isExpoPushToken(expoPushToken)) {
        throw new Error('Invalid Expo push token');
      }

      // Find existing token or create new one
      let token = await NotificationToken.findOne({ userId, deviceId });

      if (token) {
        // Update existing token
        token.expoPushToken = expoPushToken;
        token.platform = platform;
        token.active = true;
        token.lastUsed = Date.now();
        await token.save();
      } else {
        // Create new token
        token = await NotificationToken.create({
          userId,
          expoPushToken,
          deviceId,
          platform,
          active: true
        });
      }

      logger.info(`Registered push token for user ${userId} on ${platform}`);
      return token;
    } catch (error) {
      logger.error(`Failed to register push token: ${error.message}`);
      throw error;
    }
  }

  /**
   * Unregister a push notification token
   */
  static async unregisterToken(userId, deviceId) {
    try {
      const result = await NotificationToken.findOneAndUpdate(
        { userId, deviceId },
        { active: false },
        { new: true }
      );

      if (result) {
        logger.info(`Unregistered push token for user ${userId}`);
      }

      return result;
    } catch (error) {
      logger.error(`Failed to unregister push token: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all active tokens for a user
   */
  static async getUserTokens(userId) {
    try {
      return await NotificationToken.find({ userId, active: true });
    } catch (error) {
      logger.error(`Failed to get user tokens: ${error.message}`);
      return [];
    }
  }

  /**
   * Send push notification to specific users
   */
  static async sendToUsers(userIds, notification) {
    try {
      if (!Array.isArray(userIds)) {
        userIds = [userIds];
      }

      // Get all active tokens for these users
      const tokens = await NotificationToken.find({
        userId: { $in: userIds },
        active: true
      });

      if (tokens.length === 0) {
        logger.info('No active tokens found for specified users');
        return { success: true, sent: 0 };
      }

      // Create messages array
      const messages = tokens.map(token => ({
        to: token.expoPushToken,
        sound: 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        priority: 'high',
        channelId: 'ride-updates'
      }));

      // Send notifications in chunks
      const chunks = expo.chunkPushNotifications(messages);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          logger.error(`Error sending notification chunk: ${error.message}`);
        }
      }

      // Log results
      const successCount = tickets.filter(ticket => ticket.status === 'ok').length;
      const errorCount = tickets.filter(ticket => ticket.status === 'error').length;

      logger.info(`Sent ${successCount} notifications, ${errorCount} failed`);

      // Handle errors and remove invalid tokens
      tickets.forEach((ticket, index) => {
        if (ticket.status === 'error') {
          logger.error(`Notification error: ${ticket.message}`);
          
          // Remove invalid tokens
          if (ticket.details && ticket.details.error === 'DeviceNotRegistered') {
            const token = tokens[index];
            if (token) {
              NotificationToken.findByIdAndUpdate(token._id, { active: false }).catch(err => {
                logger.error(`Failed to deactivate invalid token: ${err.message}`);
              });
            }
          }
        }
      });

      return { success: true, sent: successCount, failed: errorCount, tickets };
    } catch (error) {
      logger.error(`Failed to send notifications: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send notification using template
   */
  static async sendTemplateNotification(userIds, templateName, data) {
    try {
      const template = notificationTemplates[templateName];
      
      if (!template) {
        throw new Error(`Unknown notification template: ${templateName}`);
      }

      const notification = template(data);
      return await this.sendToUsers(userIds, notification);
    } catch (error) {
      logger.error(`Failed to send template notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clean up old inactive tokens (run as cron job)
   */
  static async cleanupOldTokens(daysOld = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await NotificationToken.deleteMany({
        active: false,
        updatedAt: { $lt: cutoffDate }
      });

      logger.info(`Cleaned up ${result.deletedCount} old notification tokens`);
      return result;
    } catch (error) {
      logger.error(`Failed to cleanup old tokens: ${error.message}`);
      throw error;
    }
  }
}

module.exports = NotificationService;
module.exports.notificationTemplates = notificationTemplates;
