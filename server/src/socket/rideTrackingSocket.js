const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const rideService = require('../services/rideService');
const logger = require('../config/logger');

const roomName = (rideId) => `ride:${rideId}`;

const extractToken = (authToken) => {
  if (!authToken || typeof authToken !== 'string') {
    return null;
  }

  if (authToken.startsWith('Bearer ')) {
    return authToken.split(' ')[1];
  }

  return authToken;
};

const setupRideTrackingSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = extractToken(socket.handshake.auth?.token || socket.handshake.query?.token);

      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      const decoded = jwt.verify(token, env.jwtSecret);
      const user = await User.findById(decoded.userId).select('_id name role');

      if (!user) {
        return next(new Error('Invalid authentication token'));
      }

      socket.user = user;
      return next();
    } catch (_error) {
      return next(new Error('Invalid or expired socket token'));
    }
  });

  io.on('connection', (socket) => {
    socket.emit('ride:tracking:connected', {
      success: true,
      userId: socket.user._id,
      role: socket.user.role
    });

    socket.on('ride:track:join', async (payload = {}, callback) => {
      try {
        const { rideId } = payload;
        if (!rideId) {
          throw new Error('rideId is required');
        }

        const ride = await rideService.getRideById(rideId);
        const isAllowedUser = String(ride.user?._id || ride.user) === String(socket.user._id);
        const isAllowedDriver = ride.driver && String(ride.driver?._id || ride.driver) === String(socket.user._id);
        const isAdmin = socket.user.role === 'admin';

        if (!isAllowedUser && !isAllowedDriver && !isAdmin) {
          throw new Error('Not allowed to subscribe to this ride');
        }

        socket.join(roomName(rideId));

        const responsePayload = {
          success: true,
          rideId,
          status: ride.status,
          lastLocation: ride.lastLocation || null
        };

        if (callback) {
          callback(responsePayload);
        }
      } catch (error) {
        if (callback) {
          callback({ success: false, message: error.message });
        }
      }
    });

    socket.on('ride:track:leave', (payload = {}, callback) => {
      const { rideId } = payload;
      if (rideId) {
        socket.leave(roomName(rideId));
      }

      if (callback) {
        callback({ success: true, rideId: rideId || null });
      }
    });

    socket.on('ride:location:update', async (payload = {}, callback) => {
      try {
        const { rideId, latitude, longitude, heading, speed } = payload;

        const updated = await rideService.updateRideLocation({
          rideId,
          driverUserId: socket.user._id,
          latitude,
          longitude,
          heading,
          speed
        });

        if (callback) {
          callback({
            success: true,
            rideId,
            status: updated.status,
            lastLocation: updated.lastLocation
          });
        }
      } catch (error) {
        if (callback) {
          callback({ success: false, message: error.message });
        }
      }
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected (${socket.user?._id}): ${reason}`);
    });
  });
};

module.exports = setupRideTrackingSocket;
