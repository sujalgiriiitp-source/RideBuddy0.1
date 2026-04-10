const NotificationService = require('./notificationService');
const TravelIntent = require('../models/TravelIntent');
const logger = require('../config/logger');

/**
 * Notification Event Emitter
 * Hooks into ride lifecycle events and triggers notifications
 */
class NotificationEventService {
  /**
   * Emit when a new ride is created
   */
  static async onRideCreated(ride) {
    try {
      // Find users with matching travel intents
      const matchingIntents = await TravelIntent.find({
        source: { $regex: ride.source, $options: 'i' },
        destination: { $regex: ride.destination, $options: 'i' },
        status: 'open'
      }).populate('userId', '_id name');

      if (matchingIntents.length > 0) {
        const userIds = matchingIntents.map((intent) => intent.userId._id);
        
        await NotificationService.sendTemplateNotification(
          userIds,
          'rideCreated',
          ride
        );

        logger.info(`Sent ride created notifications to ${userIds.length} users`);
      }
    } catch (error) {
      logger.error(`Failed to send ride created notifications: ${error.message}`);
    }
  }

  /**
   * Emit when someone joins a ride
   */
  static async onRideJoined(ride, passenger) {
    try {
      // Notify ride creator
      const rideCreatorId = ride.createdBy._id || ride.createdBy;

      await NotificationService.sendTemplateNotification(
        rideCreatorId,
        'rideJoined',
        { ...ride.toObject(), passenger }
      );

      logger.info(`Sent ride joined notification to ride creator`);
    } catch (error) {
      logger.error(`Failed to send ride joined notification: ${error.message}`);
    }
  }

  /**
   * Emit when a ride is accepted by driver
   */
  static async onRideAccepted(ride) {
    try {
      // Notify all passengers
      const passengerIds = ride.passengers || [];
      
      if (passengerIds.length > 0) {
        await NotificationService.sendTemplateNotification(
          passengerIds,
          'rideAccepted',
          ride
        );

        logger.info(`Sent ride accepted notifications to ${passengerIds.length} passengers`);
      }

      // Also notify ride creator
      const rideCreatorId = ride.createdBy._id || ride.createdBy;
      if (!passengerIds.includes(rideCreatorId.toString())) {
        await NotificationService.sendTemplateNotification(
          rideCreatorId,
          'rideAccepted',
          ride
        );
      }
    } catch (error) {
      logger.error(`Failed to send ride accepted notifications: ${error.message}`);
    }
  }

  /**
   * Emit when a ride starts
   */
  static async onRideStarted(ride) {
    try {
      // Notify all participants (creator + passengers)
      const participants = [
        ride.createdBy._id || ride.createdBy,
        ...(ride.passengers || [])
      ];

      await NotificationService.sendTemplateNotification(
        participants,
        'rideStarted',
        ride
      );

      logger.info(`Sent ride started notifications to ${participants.length} participants`);
    } catch (error) {
      logger.error(`Failed to send ride started notifications: ${error.message}`);
    }
  }

  /**
   * Emit when a ride is completed
   */
  static async onRideCompleted(ride) {
    try {
      // Notify all participants
      const participants = [
        ride.createdBy._id || ride.createdBy,
        ...(ride.passengers || [])
      ];

      await NotificationService.sendTemplateNotification(
        participants,
        'rideCompleted',
        ride
      );

      logger.info(`Sent ride completed notifications to ${participants.length} participants`);
    } catch (error) {
      logger.error(`Failed to send ride completed notifications: ${error.message}`);
    }
  }

  /**
   * Emit when a ride is cancelled
   */
  static async onRideCancelled(ride, reason) {
    try {
      // Notify all participants
      const participants = [
        ride.createdBy._id || ride.createdBy,
        ...(ride.passengers || [])
      ];

      await NotificationService.sendTemplateNotification(
        participants,
        'rideCancelled',
        { ...ride.toObject(), reason }
      );

      logger.info(`Sent ride cancelled notifications to ${participants.length} participants`);
    } catch (error) {
      logger.error(`Failed to send ride cancelled notifications: ${error.message}`);
    }
  }

  /**
   * Emit when a travel intent matches a ride
   */
  static async onIntentMatched(intent, ride) {
    try {
      const userId = intent.userId?._id || intent.userId || intent.user;

      await NotificationService.sendTemplateNotification(
        userId,
        'intentMatched',
        { intent: intent.toObject(), ride: ride.toObject() }
      );

      logger.info(`Sent intent matched notification to user ${userId}`);
    } catch (error) {
      logger.error(`Failed to send intent matched notification: ${error.message}`);
    }
  }
}

module.exports = NotificationEventService;
