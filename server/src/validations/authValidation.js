const Joi = require('joi');

const signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('user', 'driver', 'admin').default('user'),
  phone: Joi.string().trim().allow('', null),
  fcmToken: Joi.string().trim().allow('', null).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  fcmToken: Joi.string().trim().allow('', null).optional()
});

module.exports = {
  signupSchema,
  loginSchema
};
