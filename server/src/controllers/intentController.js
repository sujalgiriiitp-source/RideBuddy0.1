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
  const intents = await intentService.getIntents(req.query);
  return sendResponse(res, StatusCodes.OK, true, 'Travel intents fetched successfully', intents);
});

const getMatches = asyncHandler(async (req, res) => {
  const matches = await intentService.getMatches({
    userId: req.user._id,
    source: req.query.source,
    destination: req.query.destination,
    dateTime: req.query.dateTime
  });

  return sendResponse(res, StatusCodes.OK, true, 'Matching rides fetched successfully', matches);
});

module.exports = {
  createIntent,
  getIntents,
  getMatches
};
