const Joi = require('joi');

const registerTokenSchema = Joi.object({
  expoPushToken: Joi.string()
    .required()
    .pattern(/^ExponentPushToken\[.+\]$|^ExpoPushToken\[.+\]$/)
    .messages({
      'string.pattern.base': 'Invalid Expo push token format',
      'any.required': 'Push token is required'
    }),
  deviceId: Joi.string()
    .required()
    .min(10)
    .max(100)
    .messages({
      'string.min': 'Device ID must be at least 10 characters',
      'any.required': 'Device ID is required'
    }),
  platform: Joi.string()
    .valid('ios', 'android', 'web')
    .required()
    .messages({
      'any.only': 'Platform must be ios, android, or web',
      'any.required': 'Platform is required'
    })
});

const unregisterTokenSchema = Joi.object({
  deviceId: Joi.string()
    .required()
    .min(10)
    .max(100)
    .messages({
      'any.required': 'Device ID is required'
    })
});

module.exports = {
  registerTokenSchema,
  unregisterTokenSchema
};
