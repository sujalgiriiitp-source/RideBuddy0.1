const { StatusCodes } = require('http-status-codes');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const Driver = require('../models/Driver');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { getSocketServer } = require('../config/socket');
const NotificationEventService = require('./notificationEventService');

const rideRoom = (rideId) => `ride:${rideId}`;

const emitRideEvent = (rideId, eventName, payload) => {
  const io = getSocketServer();
  if (!io) {
    return;
  }

  io.to(rideRoom(rideId)).emit(eventName, payload);
};

const hasCompleteVehicleDetails = (user) => {
  if (!user) {
    return false;
  }

  return Boolean(
    user.vehicleType &&
      user.vehicleBrand &&
      user.vehicleModel &&
      user.vehicleColor &&
      user.numberPlate
  );
};

const createRide = async ({ userId, pickup, drop, source, destination, dateTime, price, seatsAvailable }) => {
  const resolvedPickup = pickup || source;
  const resolvedDrop = drop || destination;
  const parsedRideDate = new Date(dateTime);

  if (Number.isNaN(parsedRideDate.getTime())) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Date & time must be valid');
  }

  if (parsedRideDate.getFullYear() < 2024) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Ride date must be in year 2024 or later');
  }

  if (parsedRideDate.getTime() < Date.now()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Ride date cannot be in the past');
  }

  const creator = await User.findById(userId).select(
    'vehicleType vehicleBrand vehicleModel vehicleColor numberPlate'
  );

  if (!hasCompleteVehicleDetails(creator)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please add vehicle details before creating a ride'
    );
  }

  const ride = await Ride.create({
    pickup: resolvedPickup,
    drop: resolvedDrop,
    user: userId,
    status: 'pending',
    createdBy: userId,
    source: resolvedPickup,
    destination: resolvedDrop,
    dateTime: parsedRideDate,
    price,
    seatsAvailable,
    passengers: []
  });

  const populatedRide = await Ride.findById(ride._id)
    .populate('createdBy', 'name email phone role profilePhoto vehicleType vehicleBrand vehicleModel vehicleColor numberPlate')
    .populate('user', 'name email phone role profilePhoto vehicleType vehicleBrand vehicleModel vehicleColor numberPlate')
    .populate('driver', 'name email phone role profilePhoto vehicleType vehicleBrand vehicleModel vehicleColor numberPlate')
    .populate('passengers', 'name email');

  emitRideEvent(ride._id, 'ride:status:update', {
    rideId: ride._id,
    status: ride.status,
    pickup: ride.pickup,
    drop: ride.drop,
    updatedAt: ride.updatedAt
  });

  // Trigger notification for matching intents
  NotificationEventService.onRideCreated(ride).catch(err => {
    // Log but don't fail the request
    console.error('Notification error:', err);
  });

  return populatedRide;
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
    .populate('createdBy', 'name email phone profilePhoto vehicleType vehicleBrand vehicleModel vehicleColor numberPlate')
    .populate('passengers', 'name email')
    .sort({ dateTime: 1 });
};

const getRideById = async (rideId) => {
  const ride = await Ride.findById(rideId)
    .populate('createdBy', 'name email phone role profilePhoto vehicleType vehicleBrand vehicleModel vehicleColor numberPlate')
    .populate('user', 'name email phone role profilePhoto vehicleType vehicleBrand vehicleModel vehicleColor numberPlate')
    .populate('driver', 'name email phone role profilePhoto vehicleType vehicleBrand vehicleModel vehicleColor numberPlate')
    .populate('passengers', 'name email');

  if (!ride) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Ride not found');
  }

  return ride;
};

const acceptRide = async ({ rideId, driverUserId }) => {
  const driverUser = await User.findById(driverUserId).select('role');
  if (!driverUser || !['driver', 'admin'].includes(driverUser.role)) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only drivers or admins can accept rides');
  }

  await Driver.findOneAndUpdate(
    { user: driverUserId },
    { $setOnInsert: { user: driverUserId, isAvailable: true } },
    { upsert: true, new: true }
  );

  const ride = await Ride.findById(rideId);
  if (!ride) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Ride not found');
  }

  if (ride.status !== 'pending') {
    throw new ApiError(StatusCodes.BAD_REQUEST, `Ride is already ${ride.status}`);
  }

  const updatedRide = await Ride.findByIdAndUpdate(
    rideId,
    {
      $set: {
        driver: driverUserId,
        status: 'accepted'
      }
    },
    { new: true }
  )
    .populate('user', 'name email phone role')
    .populate('driver', 'name email phone role');

  emitRideEvent(rideId, 'ride:status:update', {
    rideId,
    status: updatedRide.status,
    driver: updatedRide.driver,
    updatedAt: updatedRide.updatedAt
  });

  // Trigger notification for ride acceptance
  NotificationEventService.onRideAccepted(updatedRide).catch(err => {
    console.error('Notification error:', err);
  });

  return updatedRide;
};

const getRideStatus = async ({ rideId }) => {
  const ride = await Ride.findById(rideId).select('status pickup drop source destination user driver createdAt updatedAt');

  if (!ride) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Ride not found');
  }

  return {
    rideId: ride._id,
    status: ride.status,
    pickup: ride.pickup || ride.source,
    drop: ride.drop || ride.destination,
    user: ride.user,
    driver: ride.driver,
    lastLocation: ride.lastLocation || null,
    createdAt: ride.createdAt,
    updatedAt: ride.updatedAt
  };
};

const updateRideLocation = async ({ rideId, driverUserId, latitude, longitude, heading, speed }) => {
  if (!rideId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'rideId is required');
  }

  if (latitude === undefined || longitude === undefined) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'latitude and longitude are required');
  }

  const ride = await Ride.findById(rideId).populate('driver', '_id role');
  if (!ride) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Ride not found');
  }

  if (ride.status === 'completed') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Ride is already completed');
  }

  if (!ride.driver || String(ride.driver._id || ride.driver) !== String(driverUserId)) {
    const actor = await User.findById(driverUserId).select('role');
    const isAdmin = actor?.role === 'admin';

    if (!isAdmin) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Only the assigned driver can update location');
    }
  }

  const updatedRide = await Ride.findByIdAndUpdate(
    rideId,
    {
      $set: {
        lastLocation: {
          latitude: Number(latitude),
          longitude: Number(longitude),
          heading: heading !== undefined ? Number(heading) : undefined,
          speed: speed !== undefined ? Number(speed) : undefined,
          updatedAt: new Date()
        }
      }
    },
    { new: true }
  ).select('status user driver lastLocation updatedAt');

  emitRideEvent(rideId, 'ride:location:update', {
    rideId,
    status: updatedRide.status,
    lastLocation: updatedRide.lastLocation,
    updatedAt: updatedRide.updatedAt
  });

  return updatedRide;
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
    .populate('createdBy', 'name email phone profilePhoto vehicleType vehicleBrand vehicleModel vehicleColor numberPlate')
    .populate('passengers', 'name email');

  // Trigger notification for ride join
  const passenger = await User.findById(userId).select('name email');
  NotificationEventService.onRideJoined(hydratedRide, passenger).catch(err => {
    console.error('Notification error:', err);
  });

  return {
    ride: hydratedRide,
    booking
  };
};

module.exports = {
  createRide,
  acceptRide,
  getRideStatus,
  updateRideLocation,
  getRides,
  getRideById,
  joinRide
};
