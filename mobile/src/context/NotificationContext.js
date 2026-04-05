import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import NotificationServiceMobile from '../services/notificationService';
import { useAuth } from './AuthContext';

const resolveNotificationService = (serviceModule) => {
  if (!serviceModule) {
    return {};
  }

  if (serviceModule.default) {
    return serviceModule.default;
  }

  return serviceModule;
};

const notificationService = resolveNotificationService(NotificationServiceMobile);

const safeIsNotificationsAvailable = () => {
  if (typeof notificationService?.isAvailable === 'function') {
    return Boolean(notificationService.isAvailable());
  }

  return false;
};

const NotificationContext = createContext({
  hasPermission: false,
  expoPushToken: null,
  notification: null,
  requestPermission: async () => {},
  clearNotifications: async () => {}
});

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children, navigation }) => {
  const { user } = useAuth();
  const [hasPermission, setHasPermission] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [notification, setNotification] = useState(null);
  const notificationsEnabled = safeIsNotificationsAvailable();

  useEffect(() => {
    console.log('[NotificationContext] init', { platform: Platform.OS, hasUser: Boolean(user) });
  }, [user]);

  // Register for push notifications when user logs in
  useEffect(() => {
    if (user && notificationsEnabled) {
      registerForPushNotifications();
    }

    return () => {
      if (typeof notificationService?.removeNotificationListeners === 'function') {
        notificationService.removeNotificationListeners();
      }
    };
  }, [user, notificationsEnabled]);

  // Setup notification listeners
  useEffect(() => {
    if (!user || !notificationsEnabled) return;

    if (typeof notificationService?.setupNotificationListeners !== 'function') {
      return;
    }

    notificationService.setupNotificationListeners(
      (notification) => {
        // Handle foreground notification
        setNotification(notification);
      },
      (response) => {
        // Handle notification tap
        handleNotificationTap(response);
      }
    );

    return () => {
      if (typeof notificationService?.removeNotificationListeners === 'function') {
        notificationService.removeNotificationListeners();
      }
    };
  }, [user, navigation, notificationsEnabled]);

  const registerForPushNotifications = async () => {
    try {
      if (!notificationsEnabled) {
        return null;
      }

      if (typeof notificationService?.registerForPushNotifications !== 'function') {
        return null;
      }

      const token = await notificationService.registerForPushNotifications();
      if (token) {
        setExpoPushToken(token);
        setHasPermission(true);
      }
    } catch (error) {
      console.error('Error in push notification registration:', error);
    }
  };

  const requestPermission = async () => {
    if (!notificationsEnabled) {
      setHasPermission(false);
      return false;
    }

    if (typeof notificationService?.requestPermissions !== 'function') {
      setHasPermission(false);
      return false;
    }

    const granted = await notificationService.requestPermissions();
    setHasPermission(granted);
    
    if (granted && user) {
      await registerForPushNotifications();
    }
    
    return granted;
  };

  const clearNotifications = async () => {
    if (!notificationsEnabled) {
      setNotification(null);
      return;
    }

    if (typeof notificationService?.clearAllNotifications === 'function') {
      await notificationService.clearAllNotifications();
    }
    setNotification(null);
  };

  const handleNotificationTap = (response) => {
    const data = response?.notification?.request?.content?.data || {};
    
    if (!navigation) return;

    // Route based on notification type
    switch (data.type) {
      case 'ride_created':
      case 'ride_joined':
      case 'ride_accepted':
      case 'ride_started':
      case 'ride_completed':
      case 'ride_cancelled':
        if (data.rideId) {
          navigation.navigate('Ride Details', { rideId: data.rideId });
        }
        break;
      
      case 'intent_matched':
        if (data.rideId) {
          navigation.navigate('Ride Details', { rideId: data.rideId });
        }
        break;
      
      default:
        console.log('Unknown notification type:', data.type);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        hasPermission,
        expoPushToken,
        notification,
        requestPermission,
        clearNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
