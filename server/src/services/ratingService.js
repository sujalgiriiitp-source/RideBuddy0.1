const { StatusCodes } = require('http-status-codes');
const Rating = require('../models/Rating');
const Ride = require('../models/Ride');
const ApiError = require('../utils/ApiError');

const asId = (value) => String(value || '');

const submitRating = async ({ rideId, raterId, ratedUserId, stars, review = '' }) => {
  if (asId(raterId) === asId(ratedUserId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You cannot rate yourself');
  }

  const ride = await Ride.findById(rideId).select('createdBy passengers dateTime');
  if (!ride) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Ride not found');
  }

  const rideTime = new Date(ride.dateTime).getTime();
  if (!Number.isFinite(rideTime)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Ride datetime is invalid');
  }

  if (rideTime > Date.now()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Ratings are allowed only after ride completion');
  }

  const participants = [ride.createdBy, ...(ride.passengers || [])].map((participant) => asId(participant));

  if (!participants.includes(asId(raterId))) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You can only rate rides you participated in');
  }

  if (!participants.includes(asId(ratedUserId))) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Rated user did not participate in this ride');
  }

  const existing = await Rating.findOne({
    rideId,
    raterId,
    ratedUserId
  });

  if (existing) {
    throw new ApiError(StatusCodes.CONFLICT, 'You already submitted a rating for this ride');
  }

  const rating = await Rating.create({
    rideId,
    raterId,
    ratedUserId,
    stars,
    review
  });

  return Rating.findById(rating._id)
    .populate('raterId', 'name email')
    .populate('ratedUserId', 'name email')
    .populate('rideId', 'source destination dateTime price');
};

const getUserRatings = async ({ userId }) => {
  const ratings = await Rating.find({ ratedUserId: userId })
    .populate('raterId', 'name email')
    .populate('rideId', 'source destination dateTime price')
    .sort({ createdAt: -1 });

  const totalReviews = ratings.length;
  const averageRating =
    totalReviews > 0
      ? Number((ratings.reduce((sum, rating) => sum + Number(rating.stars || 0), 0) / totalReviews).toFixed(1))
      : 0;

  const totalRideCount = new Set(ratings.map((rating) => asId(rating.rideId?._id || rating.rideId))).size;

  return {
    averageRating,
    totalReviews,
    totalRideCount,
    ratings
  };
};

module.exports = {
  submitRating,
  getUserRatings
};
