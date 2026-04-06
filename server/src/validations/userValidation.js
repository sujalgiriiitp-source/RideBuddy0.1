const Joi = require('joi');

const indianPlateRegex = /^[A-Za-z]{2}[\s-]?\d{1,2}[\s-]?[A-Za-z]{1,3}[\s-]?\d{4}$/;
const imageDataRegex = /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=\s]+$/i;
const imageUrlRegex = /^https?:\/\/.+/i;

const updateVehicleSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  phone: Joi.string().trim().min(8).max(20).required(),
  vehicleType: Joi.string().valid('Car', 'Auto', 'Bike').required(),
  vehicleBrand: Joi.string().trim().min(2).max(50).required(),
  vehicleModel: Joi.string().trim().min(1).max(50).required(),
  vehicleColor: Joi.string().trim().min(2).max(30).required(),
  numberPlate: Joi.string().trim().pattern(indianPlateRegex).required().messages({
    'string.pattern.base': 'Number plate must be a valid Indian format (e.g. UP32AB1234)'
  })
});

const userProfileParamsSchema = Joi.object({
  userId: Joi.string().hex().length(24).required()
});

const uploadPhotoSchema = Joi.object({
  profilePhoto: Joi.string().trim().max(2_000_000).required().custom((value, helpers) => {
    if (!imageDataRegex.test(value) && !imageUrlRegex.test(value)) {
      return helpers.error('any.invalid');
    }
    return value;
  }).messages({
    'any.invalid': 'Profile photo must be a valid image URL or base64 image data URI'
  })
});

module.exports = {
  updateVehicleSchema,
  userProfileParamsSchema,
  uploadPhotoSchema
};
