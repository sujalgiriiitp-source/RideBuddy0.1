import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import NotificationServiceMobile from '../services/notificationService';
import { useAuth } from './AuthContext';

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

  // Register for push notifications when user logs in
  useEffect(() => {
    if (user && Platform.OS !== 'web') {
      registerForPushNotifications();
    }

    return () => {
      NotificationServiceMobile.removeNotificationListeners();
    };
  }, [user]);

  // Setup notification listeners
  useEffect(() => {
    if (!user) return;

    NotificationServiceMobile.setupNotificationListeners(
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
      NotificationServiceMobile.removeNotificationListeners();
    };
  }, [user, navigation]);

  const registerForPushNotifications = async () => {
    try {
      const token = await NotificationServiceMobile.registerForPushNotifications();
      if (token) {
        setExpoPushToken(token);
        setHasPermission(true);
      }
    } catch (error) {
      console.error('Error in push notification registration:', error);
    }
  };

  const requestPermission = async () => {
    const granted = await NotificationServiceMobile.requestPermissions();
    setHasPermission(granted);
    
    if (granted && user) {
      await registerForPushNotifications();
    }
    
    return granted;
  };

  const clearNotifications = async () => {
    await NotificationServiceMobile.clearAllNotifications();
    setNotification(null);
  };

  const handleNotificationTap = (response) => {
    const data = response.notification.request.content.data;
    
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
