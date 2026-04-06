const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('../middleware/asyncHandler');
const bookingService = require('../services/bookingService');
const sendResponse = require('../utils/response');

const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking({
    rideId: req.body.rideId,
    userId: req.user._id,
    requestedUserId: req.body.userId,
    seats: req.body.seats
  });

  return sendResponse(res, StatusCodes.CREATED, true, 'Booking confirmed', booking);
});

const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getMyBookings({
    userId: req.user._id,
    status: req.query.status
  });

  return sendResponse(res, StatusCodes.OK, true, 'Bookings fetched successfully', bookings);
});

const getMyRideBooking = asyncHandler(async (req, res) => {
  const bookingInfo = await bookingService.getMyRideBooking({
    userId: req.user._id,
    rideId: req.params.rideId
  });

  return sendResponse(res, StatusCodes.OK, true, 'Ride booking status fetched successfully', bookingInfo);
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking({
    bookingId: req.params.id,
    userId: req.user._id
  });

  return sendResponse(res, StatusCodes.OK, true, 'Booking cancelled successfully', booking);
});

module.exports = {
  createBooking,
  getMyBookings,
  getMyRideBooking,
  cancelBooking
};
