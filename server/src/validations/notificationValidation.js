const Joi = require('joi');

const registerTokenSchema = Joi.object({
  expoPushToken: Joi.string()
    .optional()
    .pattern(/^ExponentPushToken\[.+\]$|^ExpoPushToken\[.+\]$/)
    .messages({
      'string.pattern.base': 'Invalid Expo push token format'
    }),
  fcmToken: Joi.string().trim().min(20).optional(),
  deviceId: Joi.string()
    .optional()
    .min(10)
    .max(100),
  platform: Joi.string()
    .valid('ios', 'android', 'web')
    .optional()
}).or('expoPushToken', 'fcmToken');

const unregisterTokenSchema = Joi.object({
  deviceId: Joi.string()
    .required()
    .min(10)
    .max(100)
    .messages({
      'any.required': 'Device ID is required'
    })
});

const notificationIdParamsSchema = Joi.object({
  id: Joi.string().hex().length(24).required()
});

module.exports = {
  registerTokenSchema,
  unregisterTokenSchema,
  notificationIdParamsSchema
};
