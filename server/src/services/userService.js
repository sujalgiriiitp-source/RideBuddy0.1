const User = require('../models/User');

const getProfile = async (userId) => {
  return User.findById(userId).select('-password');
};

module.exports = {
  getProfile
};
