const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('../middleware/asyncHandler');
const NotificationService = require('../services/notificationService');
const Notification = require('../models/Notification');
const sendResponse = require('../utils/response');
const ApiError = require('../utils/ApiError');

const registerToken = asyncHandler(async (req, res) => {
  const { expoPushToken, fcmToken, deviceId, platform } = req.body;
  const token = await NotificationService.registerToken(
    req.user._id,
    expoPushToken,
    deviceId,
    platform,
    fcmToken
  );

  return sendResponse(res, StatusCodes.CREATED, true, 'Push token registered successfully', {
    tokenId: token?._id || null,
    fcmTokenSaved: Boolean(fcmToken)
  });
});

const unregisterToken = asyncHandler(async (req, res) => {
  const { deviceId } = req.body;
  await NotificationService.unregisterToken(req.user._id, deviceId);
  return sendResponse(res, StatusCodes.OK, true, 'Push token unregistered successfully', null);
});

const getTokens = asyncHandler(async (req, res) => {
  const tokens = await NotificationService.getUserTokens(req.user._id);
  return sendResponse(res, StatusCodes.OK, true, 'Tokens fetched successfully', tokens);
});

const getUnreadNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    userId: req.user._id,
    isRead: false
  })
    .sort({ createdAt: -1 })
    .lean();

  return sendResponse(res, StatusCodes.OK, true, 'Unread notifications fetched successfully', notifications);
});

const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $set: { isRead: true } },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Notification not found');
  }

  return sendResponse(res, StatusCodes.OK, true, 'Notification marked as read', notification);
});

module.exports = {
  registerToken,
  unregisterToken,
  getTokens,
  getUnreadNotifications,
  markNotificationAsRead
};
