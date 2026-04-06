const Joi = require('joi');

const objectIdSchema = Joi.string().hex().length(24);

const createBookingSchema = Joi.object({
  rideId: objectIdSchema.required(),
  userId: objectIdSchema.optional(),
  seats: Joi.number().integer().min(1).default(1)
});

const cancelBookingParamsSchema = Joi.object({
  id: objectIdSchema.required()
});

const rideBookingCheckParamsSchema = Joi.object({
  rideId: objectIdSchema.required()
});

const bookingQuerySchema = Joi.object({
  status: Joi.string().valid('confirmed', 'cancelled').optional()
});

module.exports = {
  createBookingSchema,
  cancelBookingParamsSchema,
  rideBookingCheckParamsSchema,
  bookingQuerySchema
};
