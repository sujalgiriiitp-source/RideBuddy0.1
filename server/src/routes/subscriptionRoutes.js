const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const { authenticateToken } = require('../middleware/authMiddleware');
const { SUBSCRIPTION_TIERS, getTierFeatures } = require('../config/subscriptionTiers');

router.get('/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const tierFeatures = getTierFeatures(user.subscriptionTier);
    const now = new Date();
    
    let isActive = true;
    let daysRemaining = null;

    if (user.subscriptionTier !== SUBSCRIPTION_TIERS.FREE) {
      if (user.subscriptionEndDate && now > user.subscriptionEndDate) {
        user.subscriptionTier = SUBSCRIPTION_TIERS.FREE;
        user.subscriptionStartDate = null;
        user.subscriptionEndDate = null;
        await user.save();
        isActive = false;
      } else if (user.subscriptionEndDate) {
        const timeDiff = user.subscriptionEndDate - now;
        daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      }
    }

    res.json({
      tier: user.subscriptionTier,
      features: tierFeatures,
      isActive,
      startDate: user.subscriptionStartDate,
      endDate: user.subscriptionEndDate,
      daysRemaining,
      dailyRideCount: user.dailyRideCount,
      maxDailyRides: tierFeatures.maxDailyRides
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/upgrade', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { tier } = req.body;

    if (!tier || !SUBSCRIPTION_TIERS[tier]) {
      return res.status(400).json({ message: 'Invalid subscription tier' });
    }

    if (tier === SUBSCRIPTION_TIERS.FREE) {
      return res.status(400).json({ message: 'Cannot upgrade to FREE tier' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const now = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    user.subscriptionTier = tier;
    user.subscriptionStartDate = now;
    user.subscriptionEndDate = endDate;
    user.dailyRideCount = 0;

    await user.save();

    const tierFeatures = getTierFeatures(tier);

    res.json({
      message: 'Subscription upgraded successfully',
      tier: user.subscriptionTier,
      features: tierFeatures,
      startDate: user.subscriptionStartDate,
      endDate: user.subscriptionEndDate
    });
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/cancel', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.subscriptionTier = SUBSCRIPTION_TIERS.FREE;
    user.subscriptionStartDate = null;
    user.subscriptionEndDate = null;
    user.dailyRideCount = 0;

    await user.save();

    res.json({
      message: 'Subscription cancelled successfully',
      tier: SUBSCRIPTION_TIERS.FREE
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.subscriptionTier !== SUBSCRIPTION_TIERS.PRO) {
      return res.status(403).json({
        message: 'Ride analytics is a PRO feature',
        upgradeRequired: true
      });
    }

    const totalRidesCreated = await Ride.countDocuments({ driver: userId });
    const totalBookings = await Booking.countDocuments({ passenger: userId });

    const ridesCreated = await Ride.find({ driver: userId })
      .select('from to price availableSeats date createdAt')
      .sort({ createdAt: -1 })
      .limit(50);

    const bookingsMade = await Booking.find({ passenger: userId })
      .populate('ride', 'from to price date')
      .select('ride seats status createdAt')
      .sort({ createdAt: -1 })
      .limit(50);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthlyRidesCreated = await Ride.countDocuments({
      driver: userId,
      createdAt: { $gte: thisMonth }
    });

    const monthlyBookings = await Booking.countDocuments({
      passenger: userId,
      createdAt: { $gte: thisMonth }
    });

    res.json({
      totalRidesCreated,
      totalBookings,
      monthlyRidesCreated,
      monthlyBookings,
      recentRidesCreated: ridesCreated,
      recentBookingsMade: bookingsMade
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/tiers', async (req, res) => {
  try {
    const { TIER_FEATURES } = require('../config/subscriptionTiers');
    
    const tiers = Object.keys(TIER_FEATURES).map(tierKey => ({
      id: tierKey,
      ...TIER_FEATURES[tierKey]
    }));

    res.json({ tiers });
  } catch (error) {
    console.error('Error fetching subscription tiers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
