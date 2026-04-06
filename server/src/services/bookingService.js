const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes');
const Booking = require('../models/Booking');
const Ride = require('../models/Ride');
const ApiError = require('../utils/ApiError');

const MIN_CANCEL_WINDOW_MS = 2 * 60 * 60 * 1000;

const ensurePositiveSeats = (value) => {
  const seats = Number(value || 1);
  if (!Number.isInteger(seats) || seats <= 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Seats must be a positive integer');
  }
  return seats;
};

const createBooking = async ({ rideId, userId, requestedUserId, seats }) => {
  const requestedSeats = ensurePositiveSeats(seats);

  if (requestedUserId && String(requestedUserId) !== String(userId)) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You can only create bookings for yourself');
  }

  const existingBooking = await Booking.findOne({
    user: userId,
    ride: rideId,
    status: 'confirmed'
  });

  if (existingBooking) {
    throw new ApiError(StatusCodes.CONFLICT, 'You already booked this ride');
  }

  const session = await mongoose.startSession();
  let createdBooking;

  try {
    await session.withTransaction(async () => {
      const ride = await Ride.findById(rideId).session(session);

      if (!ride) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Ride not found');
      }

      if (String(ride.createdBy) === String(userId)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'You cannot book your own ride');
      }

      if (!ride.seatsAvailable || ride.seatsAvailable < requestedSeats) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'No seats available');
      }

      const totalAmount = Number(ride.price || 0) * requestedSeats;

      const [booking] = await Booking.create(
        [
          {
            user: userId,
            ride: rideId,
            seatsBooked: requestedSeats,
            status: 'confirmed',
            totalAmount
          }
        ],
        { session }
      );

      ride.seatsAvailable -= requestedSeats;
      const alreadyPassenger = ride.passengers.some((passengerId) => String(passengerId) === String(userId));
      if (!alreadyPassenger) {
        ride.passengers.push(userId);
      }
      await ride.save({ session });

      createdBooking = booking;
    });
  } finally {
    await session.endSession();
  }

  const populatedBooking = await Booking.findById(createdBooking._id)
    .populate('user', 'name email phone role')
    .populate({
      path: 'ride',
      populate: { path: 'createdBy', select: 'name email phone role' }
    });

  return populatedBooking;
};

const getMyBookings = async ({ userId, status }) => {
  const query = { user: userId };
  if (status) {
    query.status = status;
  }

  return Booking.find(query)
    .populate({
      path: 'ride',
      populate: { path: 'createdBy', select: 'name email phone role' }
    })
    .sort({ createdAt: -1 });
};

const getMyRideBooking = async ({ userId, rideId }) => {
  const booking = await Booking.findOne({
    user: userId,
    ride: rideId,
    status: 'confirmed'
  }).populate({
    path: 'ride',
    populate: { path: 'createdBy', select: 'name email phone role' }
  });

  return {
    alreadyBooked: Boolean(booking),
    booking
  };
};

const cancelBooking = async ({ bookingId, userId }) => {
  const booking = await Booking.findById(bookingId).populate('ride');

  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Booking not found');
  }

  if (String(booking.user) !== String(userId)) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You are not allowed to cancel this booking');
  }

  if (booking.status !== 'confirmed') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Booking is already cancelled');
  }

  const rideDateTimestamp = new Date(booking.ride?.dateTime).getTime();
  if (!Number.isFinite(rideDateTimestamp)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Ride date is invalid');
  }

  if (rideDateTimestamp - Date.now() < MIN_CANCEL_WINDOW_MS) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Bookings can only be cancelled at least 2 hours before ride time');
  }

  const session = await mongoose.startSession();
  let updatedBooking;

  try {
    await session.withTransaction(async () => {
      const ride = await Ride.findById(booking.ride._id).session(session);

      if (!ride) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Ride not found');
      }

      ride.seatsAvailable += booking.seatsBooked;
      ride.passengers = ride.passengers.filter((passengerId) => String(passengerId) !== String(userId));
      await ride.save({ session });

      booking.status = 'cancelled';
      booking.cancelledAt = new Date();
      updatedBooking = await booking.save({ session });
    });
  } finally {
    await session.endSession();
  }

  return Booking.findById(updatedBooking._id)
    .populate('user', 'name email phone role')
    .populate({
      path: 'ride',
      populate: { path: 'createdBy', select: 'name email phone role' }
    });
};

module.exports = {
  createBooking,
  getMyBookings,
  getMyRideBooking,
  cancelBooking
};
