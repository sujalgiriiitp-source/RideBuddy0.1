const express = require('express');
const authRoutes = require('./authRoutes');
const rideRoutes = require('./rideRoutes');
const intentRoutes = require('./intentRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/rides', rideRoutes);
router.use('/intents', intentRoutes);
router.use('/users', userRoutes);

module.exports = router;
