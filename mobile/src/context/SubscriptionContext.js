import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from './AuthContext';
import { SUBSCRIPTION_TIERS, getTierFeatures } from '../constants/subscriptionTiers';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const { user } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubscriptionStatus = async () => {
    if (!user) {
      setSubscriptionData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/subscription/status');
      setSubscriptionData(response.data);
    } catch (err) {
      console.error('Error fetching subscription status:', err);
      setError(err.response?.data?.message || 'Failed to fetch subscription');
      const tierFeatures = getTierFeatures(SUBSCRIPTION_TIERS.FREE);
      setSubscriptionData({
        tier: SUBSCRIPTION_TIERS.FREE,
        features: tierFeatures,
        isActive: true,
        dailyRideCount: 0,
        maxDailyRides: 5
      });
    } finally {
      setLoading(false);
    }
  };

  const upgradeTo = async (tier) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post('/subscription/upgrade', { tier });
      setSubscriptionData(response.data);
      await fetchSubscriptionStatus();
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error upgrading subscription:', err);
      const errorMsg = err.response?.data?.message || 'Failed to upgrade subscription';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post('/subscription/cancel');
      setSubscriptionData(response.data);
      await fetchSubscriptionStatus();
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      const errorMsg = err.response?.data?.message || 'Failed to cancel subscription';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const canCreateRide = () => {
    if (!subscriptionData) return false;
    
    const { dailyRideCount, maxDailyRides } = subscriptionData;
    
    if (maxDailyRides === -1) return true;
    
    return dailyRideCount < maxDailyRides;
  };

  const getRidesRemaining = () => {
    if (!subscriptionData) return 0;
    
    const { dailyRideCount, maxDailyRides } = subscriptionData;
    
    if (maxDailyRides === -1) return Infinity;
    
    return Math.max(0, maxDailyRides - dailyRideCount);
  };

  useEffect(() => {
    if (user) {
      fetchSubscriptionStatus();
    }
  }, [user]);

  const value = {
    subscriptionData,
    tier: subscriptionData?.tier || SUBSCRIPTION_TIERS.FREE,
    features: subscriptionData?.features || getTierFeatures(SUBSCRIPTION_TIERS.FREE),
    isActive: subscriptionData?.isActive ?? true,
    loading,
    error,
    fetchSubscriptionStatus,
    upgradeTo,
    cancelSubscription,
    canCreateRide,
    getRidesRemaining,
    dailyRideCount: subscriptionData?.dailyRideCount || 0,
    maxDailyRides: subscriptionData?.maxDailyRides || 5
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
