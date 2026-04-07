export const SUBSCRIPTION_TIERS = {
  FREE: 'FREE',
  PREMIUM: 'PREMIUM',
  PRO: 'PRO'
};

export const TIER_FEATURES = {
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
    color: '#6B7280',
    gradient: ['#6B7280', '#4B5563'],
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
    maxDailyRides: -1,
    hasAds: false,
    hasPriorityBooking: true,
    hasInstantPriorityBooking: false,
    hasBasicFilters: true,
    hasAdvancedFilters: false,
    hasBasicChat: true,
    hasDirectChat: false,
    hasRideAnalytics: false,
    hasProfileBoost: false,
    badge: '⭐',
    color: '#F59E0B',
    gradient: ['#F59E0B', '#D97706'],
    features: [
      'Unlimited rides',
      'No ads',
      'Priority booking access',
      'Basic chat with drivers',
      'Filters: date, time, price'
    ]
  },
  [SUBSCRIPTION_TIERS.PRO]: {
    name: 'Pro',
    price: 199,
    currency: '₹',
    interval: 'month',
    maxDailyRides: -1,
    hasAds: false,
    hasPriorityBooking: true,
    hasInstantPriorityBooking: true,
    hasBasicFilters: true,
    hasAdvancedFilters: true,
    hasBasicChat: true,
    hasDirectChat: true,
    hasRideAnalytics: true,
    hasProfileBoost: true,
    badge: '👑',
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#7C3AED'],
    features: [
      'All Premium features',
      'Instant priority booking',
      'Top placement in rides',
      'Advanced filters (location radius, preferences)',
      'Direct chat with drivers',
      'Ride analytics (history, usage)',
      'Profile boost (higher visibility)'
    ]
  }
};

export const TIER_HIERARCHY = {
  [SUBSCRIPTION_TIERS.FREE]: 0,
  [SUBSCRIPTION_TIERS.PREMIUM]: 1,
  [SUBSCRIPTION_TIERS.PRO]: 2
};

export const getTierFeatures = (tier) => {
  return TIER_FEATURES[tier] || TIER_FEATURES[SUBSCRIPTION_TIERS.FREE];
};

export const canAccessFeature = (userTier, requiredTier) => {
  const userLevel = TIER_HIERARCHY[userTier] || 0;
  const requiredLevel = TIER_HIERARCHY[requiredTier] || 0;
  return userLevel >= requiredLevel;
};

export const hasFeature = (tier, featureName) => {
  const features = getTierFeatures(tier);
  return features[featureName] || false;
};

export const getRideLimitForTier = (tier) => {
  const features = getTierFeatures(tier);
  return features.maxDailyRides;
};
