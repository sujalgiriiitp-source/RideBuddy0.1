const express = require('express');
const authRoutes = require('./authRoutes');
const rideRoutes = require('./rideRoutes');
const intentRoutes = require('./intentRoutes');
const userRoutes = require('./userRoutes');
const notificationRoutes = require('./notificationRoutes');
const mapboxRoutes = require('./mapboxRoutes');
const uploadRoutes = require('./uploadRoutes');
const chatRoutes = require('./chatRoutes');
const conversationRoutes = require('./conversationRoutes');
const bookingRoutes = require('./bookingRoutes');
const messageRoutes = require('./messageRoutes');
const ratingRoutes = require('./ratingRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/rides', rideRoutes);
router.use('/intents', intentRoutes);
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);
router.use('/mapbox', mapboxRoutes);
router.use('/upload', uploadRoutes);
router.use('/chat', chatRoutes);
router.use('/conversations', conversationRoutes);
router.use('/messages', messageRoutes);
router.use('/bookings', bookingRoutes);
router.use('/ratings', ratingRoutes);

module.exports = router;
