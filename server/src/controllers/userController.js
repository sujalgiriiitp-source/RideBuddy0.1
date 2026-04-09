const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('../middleware/asyncHandler');
const userService = require('../services/userService');
const sendResponse = require('../utils/response');

const getProfile = asyncHandler(async (req, res) => {
  const profile = await userService.getProfile(req.user._id);
  return sendResponse(res, StatusCodes.OK, true, 'Profile fetched successfully', profile);
});

const getUserProfile = asyncHandler(async (req, res) => {
  const profile = await userService.getUserProfileById(req.params.userId);
  return sendResponse(res, StatusCodes.OK, true, 'User profile fetched successfully', profile);
});

const updateVehicle = asyncHandler(async (req, res) => {
  const profile = await userService.updateVehicleDetails({
    userId: req.user._id,
    ...req.body
  });

  return sendResponse(res, StatusCodes.OK, true, 'Vehicle details updated successfully', profile);
});

const updateProfile = asyncHandler(async (req, res) => {
  const profile = await userService.updateProfile({
    userId: req.user._id,
    ...req.body
  });

  return sendResponse(res, StatusCodes.OK, true, 'Profile updated successfully', profile);
});

const uploadPhoto = asyncHandler(async (req, res) => {
  const result = await userService.updateProfilePhoto({
    userId: req.user._id,
    profilePhoto: req.body.profilePhoto
  });

  return sendResponse(res, StatusCodes.OK, true, 'Profile photo uploaded successfully', result);
});

module.exports = {
  getProfile,
  getUserProfile,
  updateVehicle,
  uploadPhoto,
  updateProfile
};
