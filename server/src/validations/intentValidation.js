const Joi = require('joi');

const createIntentSchema = Joi.object({
  source: Joi.string().trim().required(),
  destination: Joi.string().trim().required(),
  dateTime: Joi.date().iso().required()
});

const intentQuerySchema = Joi.object({
  source: Joi.string().trim().optional(),
  destination: Joi.string().trim().optional(),
  date: Joi.date().iso().optional()
});

const nearbyIntentQuerySchema = Joi.object({
  source: Joi.string().trim().optional(),
  destination: Joi.string().trim().optional(),
  lookAheadHours: Joi.number().integer().min(1).max(168).optional()
});

const respondIntentSchema = Joi.object({
  action: Joi.string().trim().valid('accept', 'decline').required()
});

const intentIdParamsSchema = Joi.object({
  id: Joi.string().hex().length(24).required()
});

module.exports = {
  createIntentSchema,
  intentQuerySchema,
  nearbyIntentQuerySchema,
  respondIntentSchema,
  intentIdParamsSchema
};
