const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('../middleware/asyncHandler');
const rideService = require('../services/rideService');
const sendResponse = require('../utils/response');

const createRide = asyncHandler(async (req, res) => {
  const ride = await rideService.createRide({
    userId: req.user._id,
    ...req.body
  });

  return sendResponse(res, StatusCodes.CREATED, true, 'Ride created successfully', ride);
});

const getRides = asyncHandler(async (req, res) => {
  const rides = await rideService.getRides(req.query);
  return sendResponse(res, StatusCodes.OK, true, 'Rides fetched successfully', rides);
});

const getRideById = asyncHandler(async (req, res) => {
  const ride = await rideService.getRideById(req.params.id);
  return sendResponse(res, StatusCodes.OK, true, 'Ride fetched successfully', ride);
});

const joinRide = asyncHandler(async (req, res) => {
  const result = await rideService.joinRide({
    rideId: req.params.id,
    userId: req.user._id,
    seatsBooked: req.body?.seatsBooked
  });

  return sendResponse(res, StatusCodes.OK, true, 'Ride joined successfully', result);
});

const acceptRide = asyncHandler(async (req, res) => {
  const ride = await rideService.acceptRide({
    rideId: req.body.rideId,
    driverUserId: req.user._id
  });

  return sendResponse(res, StatusCodes.OK, true, 'Ride accepted successfully', ride);
});

const getRideStatus = asyncHandler(async (req, res) => {
  const status = await rideService.getRideStatus({
    rideId: req.query.rideId || req.body.rideId
  });

  return sendResponse(res, StatusCodes.OK, true, 'Ride status fetched successfully', status);
});

module.exports = {
  createRide,
  acceptRide,
  getRideStatus,
  getRides,
  getRideById,
  joinRide
};
