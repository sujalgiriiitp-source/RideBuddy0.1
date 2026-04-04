const Joi = require('joi');

const createRideSchema = Joi.object({
  pickup: Joi.string().trim(),
  drop: Joi.string().trim(),
  source: Joi.string().trim(),
  destination: Joi.string().trim(),
  sourceCoordinates: Joi.object({
    longitude: Joi.number().min(-180).max(180).required(),
    latitude: Joi.number().min(-90).max(90).required()
  }).optional(),
  destinationCoordinates: Joi.object({
    longitude: Joi.number().min(-180).max(180).required(),
    latitude: Joi.number().min(-90).max(90).required()
  }).optional(),
  routePolyline: Joi.array().items(Joi.array().items(Joi.number()).length(2)).optional(),
  distance: Joi.number().min(0).optional(),
  estimatedDuration: Joi.number().min(0).optional(),
  dateTime: Joi.date().iso().required(),
  price: Joi.number().min(0).required(),
  seatsAvailable: Joi.number().integer().min(1).required()
})
  .or('pickup', 'source')
  .or('drop', 'destination');

const joinRideSchema = Joi.object({
  seatsBooked: Joi.number().integer().min(1).optional()
});

const acceptRideSchema = Joi.object({
  rideId: Joi.string().hex().length(24).required()
});

const rideStatusSchema = Joi.object({
  rideId: Joi.string().hex().length(24).required()
});

const rideQuerySchema = Joi.object({
  source: Joi.string().trim().optional(),
  destination: Joi.string().trim().optional(),
  date: Joi.date().iso().optional()
});

module.exports = {
  createRideSchema,
  acceptRideSchema,
  rideStatusSchema,
  joinRideSchema,
  rideQuerySchema
};
