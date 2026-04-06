const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('../middleware/asyncHandler');
const ratingService = require('../services/ratingService');
const sendResponse = require('../utils/response');

const createRating = asyncHandler(async (req, res) => {
  const rating = await ratingService.submitRating({
    rideId: req.body.rideId,
    raterId: req.user._id,
    ratedUserId: req.body.ratedUserId,
    stars: req.body.stars,
    review: req.body.review
  });

  return sendResponse(res, StatusCodes.CREATED, true, 'Rating submitted successfully', rating);
});

const getRatingsForUser = asyncHandler(async (req, res) => {
  const summary = await ratingService.getUserRatings({
    userId: req.params.userId
  });

  return sendResponse(res, StatusCodes.OK, true, 'Ratings fetched successfully', summary);
});

module.exports = {
  createRating,
  getRatingsForUser
};
