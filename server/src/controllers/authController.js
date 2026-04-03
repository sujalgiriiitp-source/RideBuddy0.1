const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('../middleware/asyncHandler');
const authService = require('../services/authService');
const sendResponse = require('../utils/response');

const signup = asyncHandler(async (req, res) => {
  const result = await authService.signup(req.body);
  return sendResponse(res, StatusCodes.CREATED, true, 'Signup successful', result);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return sendResponse(res, StatusCodes.OK, true, 'Login successful', result);
});

module.exports = {
  signup,
  login
};
