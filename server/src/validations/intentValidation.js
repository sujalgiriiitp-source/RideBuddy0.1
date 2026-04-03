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

const matchQuerySchema = Joi.object({
  source: Joi.string().trim().optional(),
  destination: Joi.string().trim().optional(),
  dateTime: Joi.date().iso().optional()
});

module.exports = {
  createIntentSchema,
  intentQuerySchema,
  matchQuerySchema
};
