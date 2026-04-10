const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('../middleware/asyncHandler');
const intentService = require('../services/intentService');
const sendResponse = require('../utils/response');

const createIntent = asyncHandler(async (req, res) => {
  const intent = await intentService.createIntent({
    userId: req.user._id,
    ...req.body
  });

  return sendResponse(res, StatusCodes.CREATED, true, 'Travel intent posted successfully', intent);
});

const getIntents = asyncHandler(async (req, res) => {
  const intents = await intentService.getIntents({
    ...req.query,
    excludeUserId: req.user?._id
  });
  return sendResponse(res, StatusCodes.OK, true, 'Travel intents fetched successfully', intents);
});

const getNearbyIntents = asyncHandler(async (req, res) => {
  const intents = await intentService.getNearbyIntents({
    userId: req.user._id,
    source: req.query.source,
    destination: req.query.destination,
    lookAheadHours: req.query.lookAheadHours
  });

  return sendResponse(res, StatusCodes.OK, true, 'Nearby intents fetched successfully', intents);
});

const getMyIntents = asyncHandler(async (req, res) => {
  const intents = await intentService.getMyIntents({ userId: req.user._id });
  return sendResponse(res, StatusCodes.OK, true, 'Your intents fetched successfully', intents);
});

const respondToIntent = asyncHandler(async (req, res) => {
  const result = await intentService.respondToIntent({
    intentId: req.params.id,
    driverId: req.user._id,
    action: req.body.action
  });

  return sendResponse(res, StatusCodes.OK, true, 'Intent response saved successfully', {
    intentId: result.intent._id,
    conversationId: result.conversationId
  });
});

const cancelIntent = asyncHandler(async (req, res) => {
  const intent = await intentService.cancelIntent({
    intentId: req.params.id,
    userId: req.user._id
  });

  return sendResponse(res, StatusCodes.OK, true, 'Intent cancelled successfully', intent);
});

module.exports = {
  createIntent,
  getIntents,
  getNearbyIntents,
  getMyIntents,
  respondToIntent,
  cancelIntent
};
