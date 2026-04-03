const Joi = require('joi');

const createRideSchema = Joi.object({
  source: Joi.string().trim().required(),
  destination: Joi.string().trim().required(),
  dateTime: Joi.date().iso().required(),
  price: Joi.number().min(0).required(),
  seatsAvailable: Joi.number().integer().min(1).required()
});

const joinRideSchema = Joi.object({
  seatsBooked: Joi.number().integer().min(1).optional()
});

const rideQuerySchema = Joi.object({
  source: Joi.string().trim().optional(),
  destination: Joi.string().trim().optional(),
  date: Joi.date().iso().optional()
});

module.exports = {
  createRideSchema,
  joinRideSchema,
  rideQuerySchema
};
