const SUBSCRIPTION_TIERS = {
  FREE: 'FREE',
  PREMIUM: 'PREMIUM',
  PRO: 'PRO'
};

const TIER_FEATURES = {
  [SUBSCRIPTION_TIERS.FREE]: {
    name: 'Free',
    price: 0,
    currency: '₹',
    interval: 'forever',
    maxDailyRides: 5,
    hasAds: true,
    hasPriorityBooking: false,
    hasInstantPriorityBooking: false,
    hasBasicFilters: true,
    hasAdvancedFilters: false,
    hasBasicChat: false,
    hasDirectChat: false,
    hasRideAnalytics: false,
    hasProfileBoost: false,
    features: [
      'Limited rides per day (max 5)',
      'Basic filters',
      'Ads enabled',
      'Standard booking'
    ]
  },
  [SUBSCRIPTION_TIERS.PREMIUM]: {
    name: 'Premium',
    price: 99,
    currency: '₹',
    interval: 'month',
    maxDailyRides: -1, // -1 means unlimited
    hasAds: false,
    hasPriorityBooking: true,
    hasInstantPriorityBooking: false,
    hasBasicFilters: true,
    hasAdvancedFilters: false,
    hasBasicChat: true,
    hasDirectChat: false,
    hasRideAnalytics: false,
    hasProfileBoost: false,
    features: [
      'Unlimited rides',
      'No ads',
      'Priority booking access',
      'Basic chat with drivers',
      'Filters: date, time, price'
    ],
    badge: '⭐'
  },
  [SUBSCRIPTION_TIERS.PRO]: {
    name: 'Pro',
    price: 199,
    currency: '₹',
    interval: 'month',
    maxDailyRides: -1, // -1 means unlimited
    hasAds: false,
    hasPriorityBooking: true,
    hasInstantPriorityBooking: true,
    hasBasicFilters: true,
    hasAdvancedFilters: true,
    hasBasicChat: true,
    hasDirectChat: true,
    hasRideAnalytics: true,
    hasProfileBoost: true,
    features: [
      'All Premium features',
      'Instant priority booking',
      'Top placement in rides',
      'Advanced filters (location radius, preferences)',
      'Direct chat with drivers',
      'Ride analytics (history, usage)',
      'Profile boost (higher visibility)'
    ],
    badge: '👑'
  }
};

const TIER_HIERARCHY = {
  [SUBSCRIPTION_TIERS.FREE]: 0,
  [SUBSCRIPTION_TIERS.PREMIUM]: 1,
  [SUBSCRIPTION_TIERS.PRO]: 2
};

function getTierFeatures(tier) {
  return TIER_FEATURES[tier] || TIER_FEATURES[SUBSCRIPTION_TIERS.FREE];
}

function canAccessFeature(userTier, requiredTier) {
  const userLevel = TIER_HIERARCHY[userTier] || 0;
  const requiredLevel = TIER_HIERARCHY[requiredTier] || 0;
  return userLevel >= requiredLevel;
}

function hasFeature(tier, featureName) {
  const features = getTierFeatures(tier);
  return features[featureName] || false;
}

function getRideLimitForTier(tier) {
  const features = getTierFeatures(tier);
  return features.maxDailyRides;
}

module.exports = {
  SUBSCRIPTION_TIERS,
  TIER_FEATURES,
  TIER_HIERARCHY,
  getTierFeatures,
  canAccessFeature,
  hasFeature,
  getRideLimitForTier
};
