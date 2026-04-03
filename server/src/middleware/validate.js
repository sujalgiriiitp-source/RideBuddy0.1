const { StatusCodes } = require('http-status-codes');
const ApiError = require('../utils/ApiError');

const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const message = error.details.map((item) => item.message).join(', ');
    return next(new ApiError(StatusCodes.BAD_REQUEST, message));
  }

  req[source] = value;
  return next();
};

module.exports = validate;
