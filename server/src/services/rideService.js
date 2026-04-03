const { StatusCodes } = require('http-status-codes');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const ApiError = require('../utils/ApiError');

const createRide = async ({ userId, source, destination, dateTime, price, seatsAvailable }) => {
  return Ride.create({
    createdBy: userId,
    source,
    destination,
    dateTime,
    price,
    seatsAvailable,
    passengers: []
  });
};

const getRides = async ({ source, destination, date }) => {
  const query = {};

  if (source) {
    query.source = { $regex: source, $options: 'i' };
  }

  if (destination) {
    query.destination = { $regex: destination, $options: 'i' };
  }

  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    query.dateTime = {
      $gte: startDate,
      $lt: endDate
    };
  }

  return Ride.find(query)
    .populate('createdBy', 'name email phone')
    .populate('passengers', 'name email')
    .sort({ dateTime: 1 });
};

const getRideById = async (rideId) => {
  const ride = await Ride.findById(rideId)
    .populate('createdBy', 'name email phone')
    .populate('passengers', 'name email');

  if (!ride) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Ride not found');
  }

  return ride;
};

const joinRide = async ({ rideId, userId, seatsBooked }) => {
  const requestedSeats = Number(seatsBooked) || 1;

  if (!Number.isInteger(requestedSeats) || requestedSeats <= 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Seats booked must be a positive integer');
  }

  const ride = await Ride.findById(rideId);

  if (!ride) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Ride not found');
  }

  if (String(ride.createdBy) === String(userId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You cannot join your own ride');
  }

  const hasAlreadyJoined = ride.passengers.some((passengerId) => String(passengerId) === String(userId));
  if (hasAlreadyJoined) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You have already joined this ride');
  }

  if (!ride.seatsAvailable || ride.seatsAvailable < requestedSeats) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'No seats available');
  }

  const updatedRide = await Ride.findOneAndUpdate(
    {
      _id: rideId,
      seatsAvailable: { $gte: requestedSeats },
      passengers: { $ne: userId }
    },
    {
      $inc: { seatsAvailable: -requestedSeats },
      $push: { passengers: userId }
    },
    { new: true }
  );

  if (!updatedRide) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Unable to join ride right now. Please try again.');
  }

  const booking = await Booking.findOneAndUpdate(
    { user: userId, ride: rideId },
    {
      $setOnInsert: {
        user: userId,
        ride: rideId,
        seatsBooked: requestedSeats
      }
    },
    { upsert: true, new: true }
  );

  const hydratedRide = await Ride.findById(rideId)
    .populate('createdBy', 'name email phone')
    .populate('passengers', 'name email');

  return {
    ride: hydratedRide,
    booking
  };
};

module.exports = {
  createRide,
  getRides,
  getRideById,
  joinRide
};
