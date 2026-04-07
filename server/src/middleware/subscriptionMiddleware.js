const { SUBSCRIPTION_TIERS, canAccessFeature, getRideLimitForTier } = require('../config/subscriptionTiers');
const User = require('../models/User');

const checkDailyRideLimit = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const maxRides = getRideLimitForTier(user.subscriptionTier);
    
    if (maxRides === -1) {
      return next();
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastReset = new Date(user.lastRideResetDate);
    lastReset.setHours(0, 0, 0, 0);

    if (today > lastReset) {
      user.dailyRideCount = 0;
      user.lastRideResetDate = today;
      await user.save();
    }

    if (user.dailyRideCount >= maxRides) {
      return res.status(403).json({
        message: 'Daily ride limit reached',
        limit: maxRides,
        currentCount: user.dailyRideCount,
        tier: user.subscriptionTier,
        upgradeRequired: true
      });
    }

    next();
  } catch (error) {
    console.error('Error checking daily ride limit:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const incrementDailyRideCount = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const maxRides = getRideLimitForTier(user.subscriptionTier);
    
    if (maxRides !== -1) {
      user.dailyRideCount += 1;
      await user.save();
    }

    next();
  } catch (error) {
    console.error('Error incrementing ride count:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const requireSubscriptionTier = (requiredTier) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!canAccessFeature(user.subscriptionTier, requiredTier)) {
        return res.status(403).json({
          message: `This feature requires ${requiredTier} subscription`,
          currentTier: user.subscriptionTier,
          requiredTier: requiredTier,
          upgradeRequired: true
        });
      }

      next();
    } catch (error) {
      console.error('Error checking subscription tier:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
};

const checkSubscriptionStatus = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.subscriptionTier !== SUBSCRIPTION_TIERS.FREE) {
      const now = new Date();
      if (user.subscriptionEndDate && now > user.subscriptionEndDate) {
        user.subscriptionTier = SUBSCRIPTION_TIERS.FREE;
        user.subscriptionStartDate = null;
        user.subscriptionEndDate = null;
        await user.save();
      }
    }

    next();
  } catch (error) {
    console.error('Error checking subscription status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  checkDailyRideLimit,
  incrementDailyRideCount,
  requireSubscriptionTier,
  checkSubscriptionStatus
};
