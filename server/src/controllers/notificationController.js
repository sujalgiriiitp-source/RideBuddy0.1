const { StatusCodes } = require('http-status-codes');
const NotificationService = require('../services/notificationService');
const logger = require('../config/logger');

/**
 * Register push notification token
 * POST /api/notifications/register-token
 */
const registerToken = async (req, res) => {
  try {
    const { expoPushToken, deviceId, platform } = req.body;
    const userId = req.user.userId;

    const token = await NotificationService.registerToken(
      userId,
      expoPushToken,
      deviceId,
      platform
    );

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Push notification token registered successfully',
      data: {
        tokenId: token._id,
        platform: token.platform,
        active: token.active
      }
    });
  } catch (error) {
    logger.error(`Register token error: ${error.message}`);
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message || 'Failed to register push token',
      data: null
    });
  }
};

/**
 * Unregister push notification token
 * DELETE /api/notifications/unregister-token
 */
const unregisterToken = async (req, res) => {
  try {
    const { deviceId } = req.body;
    const userId = req.user.userId;

    await NotificationService.unregisterToken(userId, deviceId);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Push notification token unregistered successfully',
      data: null
    });
  } catch (error) {
    logger.error(`Unregister token error: ${error.message}`);
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message || 'Failed to unregister push token',
      data: null
    });
  }
};

/**
 * Get user's registered tokens
 * GET /api/notifications/tokens
 */
const getTokens = async (req, res) => {
  try {
    const userId = req.user.userId;
    const tokens = await NotificationService.getUserTokens(userId);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Tokens retrieved successfully',
      data: tokens.map(t => ({
        id: t._id,
        platform: t.platform,
        deviceId: t.deviceId,
        active: t.active,
        lastUsed: t.lastUsed,
        createdAt: t.createdAt
      }))
    });
  } catch (error) {
    logger.error(`Get tokens error: ${error.message}`);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to retrieve tokens',
      data: null
    });
  }
};

/**
 * Test notification (development only)
 * POST /api/notifications/test
 */
const sendTestNotification = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Test notifications are disabled in production',
        data: null
      });
    }

    const userId = req.user.userId;
    const { title, body } = req.body;

    const result = await NotificationService.sendToUsers(userId, {
      title: title || '🧪 Test Notification',
      body: body || 'This is a test notification from RideBuddy',
      data: { type: 'test' }
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Test notification sent',
      data: result
    });
  } catch (error) {
    logger.error(`Send test notification error: ${error.message}`);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to send test notification',
      data: null
    });
  }
};

module.exports = {
  registerToken,
  unregisterToken,
  getTokens,
  sendTestNotification
};
