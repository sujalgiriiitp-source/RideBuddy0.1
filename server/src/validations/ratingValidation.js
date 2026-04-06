const Joi = require('joi');

const objectIdSchema = Joi.string().hex().length(24);

const createRatingSchema = Joi.object({
  rideId: objectIdSchema.required(),
  ratedUserId: objectIdSchema.required(),
  stars: Joi.number().integer().min(1).max(5).required(),
  review: Joi.string().trim().allow('').max(500).optional()
});

const userRatingsParamsSchema = Joi.object({
  userId: objectIdSchema.required()
});

module.exports = {
  createRatingSchema,
  userRatingsParamsSchema
};
