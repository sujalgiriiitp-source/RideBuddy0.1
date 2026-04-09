const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../utils/ApiError');

const normalizedPlateRegex = /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{4}$/;

const normalizePlate = (value = '') => String(value).toUpperCase().replace(/[\s-]/g, '');

const getProfile = async (userId) => {
  return User.findById(userId).select('-password');
};

const ensureUserExists = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }
  return user;
};

const updateVehicleDetails = async ({
  userId,
  name,
  phone,
  vehicleType,
  vehicleBrand,
  vehicleModel,
  vehicleColor,
  numberPlate
}) => {
  const normalizedPlate = normalizePlate(numberPlate);
  if (!normalizedPlateRegex.test(normalizedPlate)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Number plate must be a valid Indian format (e.g. UP32AB1234)');
  }

  const user = await ensureUserExists(userId);

  if (name !== undefined) {
    user.name = String(name || '').trim();
  }

  user.phone = String(phone || '').trim();
  user.vehicleType = vehicleType;
  user.vehicleBrand = String(vehicleBrand || '').trim();
  user.vehicleModel = String(vehicleModel || '').trim();
  user.vehicleColor = String(vehicleColor || '').trim();
  user.numberPlate = normalizedPlate;

  await user.save();
  return User.findById(userId).select('-password');
};

const updateProfilePhoto = async ({ userId, profilePhoto }) => {
  const user = await ensureUserExists(userId);
  user.profilePhoto = String(profilePhoto || '').trim();
  await user.save();
  return {
    profilePhoto: user.profilePhoto
  };
};

const updateProfile = async ({ userId, name, phone, profilePhoto }) => {
  const user = await ensureUserExists(userId);

  if (name !== undefined) {
    user.name = String(name || '').trim();
  }

  if (phone !== undefined) {
    user.phone = String(phone || '').trim();
  }

  if (profilePhoto !== undefined) {
    user.profilePhoto = String(profilePhoto || '').trim();
  }

  await user.save();
  return User.findById(userId).select('-password');
};

const getUserProfileById = async (userId) => {
  const profile = await User.findById(userId).select(
    'name email phone role vehicleType vehicleBrand vehicleModel vehicleColor numberPlate profilePhoto createdAt'
  );

  if (!profile) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  return profile;
};

module.exports = {
  getProfile,
  updateVehicleDetails,
  updateProfilePhoto,
  getUserProfileById,
  updateProfile
};
