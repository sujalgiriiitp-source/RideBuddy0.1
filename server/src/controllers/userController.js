const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('../middleware/asyncHandler');
const userService = require('../services/userService');
const sendResponse = require('../utils/response');

const getProfile = asyncHandler(async (req, res) => {
  const profile = await userService.getProfile(req.user._id);
  return sendResponse(res, StatusCodes.OK, true, 'Profile fetched successfully', profile);
});

module.exports = {
  getProfile
};
