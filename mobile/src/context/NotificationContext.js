import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationServiceMobile from '../services/notificationService';
import { apiRequest } from '../api';
import { useAuth } from './AuthContext';

const IN_APP_NOTIFICATIONS_KEY = '@ridebuddy:in_app_notifications';

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
  notifications: [],
  unreadCount: 0,
  addInAppNotification: () => {},
  markNotificationAsRead: () => {},
  clearInAppNotifications: async () => {},
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
  const [notifications, setNotifications] = useState([]);
  const notificationsEnabled = safeIsNotificationsAvailable();
  const unreadCount = notifications.filter((item) => !item.read).length;

  const persistInAppNotifications = async (nextNotifications) => {
    try {
      await AsyncStorage.setItem(IN_APP_NOTIFICATIONS_KEY, JSON.stringify(nextNotifications));
    } catch (error) {
      console.error('Failed to persist in-app notifications:', error);
    }
  };

  const addInAppNotification = (payload = {}) => {
    const nextNotification = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      _id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: payload.title || 'Notification',
      message: payload.message || '',
      type: payload.type || 'general',
      rideId: payload.rideId || null,
      createdAt: new Date().toISOString(),
      read: false
    };

    setNotifications((previousNotifications) => {
      const nextNotifications = [nextNotification, ...previousNotifications].slice(0, 100);
      persistInAppNotifications(nextNotifications);
      return nextNotifications;
    });
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications((previousNotifications) => {
      const nextNotifications = previousNotifications.map((item) =>
        (item.id === notificationId || item._id === notificationId) ? { ...item, read: true, isRead: true } : item
      );
      persistInAppNotifications(nextNotifications);
      return nextNotifications;
    });

    apiRequest(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    }).catch(() => {});
  };

  const clearInAppNotifications = async () => {
    setNotifications([]);
    try {
      await AsyncStorage.removeItem(IN_APP_NOTIFICATIONS_KEY);
    } catch (error) {
      console.error('Failed to clear in-app notifications:', error);
    }
  };

  useEffect(() => {
    const restoreNotifications = async () => {
      try {
        const storedNotifications = await AsyncStorage.getItem(IN_APP_NOTIFICATIONS_KEY);
        if (storedNotifications) {
          const parsedNotifications = JSON.parse(storedNotifications);
          if (Array.isArray(parsedNotifications)) {
            setNotifications(parsedNotifications);
          }
        }
      } catch (error) {
        console.error('Failed to restore in-app notifications:', error);
      }
    };

    restoreNotifications();
  }, []);

  const refreshRemoteNotifications = async () => {
    if (!user) {
      return;
    }

    try {
      const response = await apiRequest('/notifications');
      const remoteNotifications = (response.data || []).map((item) => ({
        id: item._id,
        _id: item._id,
        title: item.title,
        message: item.body,
        type: item.type,
        createdAt: item.createdAt,
        read: Boolean(item.isRead),
        isRead: Boolean(item.isRead),
        rideId: item?.data?.rideId || null,
        conversationId: item?.data?.conversationId || null
      }));
      setNotifications(remoteNotifications);
      persistInAppNotifications(remoteNotifications);
    } catch (error) {
      console.error('Failed to refresh remote notifications:', error);
    }
  };

  useEffect(() => {
    console.log('[NotificationContext] init', { platform: Platform.OS, hasUser: Boolean(user) });
    refreshRemoteNotifications().catch(() => {});
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
        const pushContent = notification?.request?.content;
        addInAppNotification({
          title: pushContent?.title || 'RideBuddy',
          message: pushContent?.body || 'You have a new update.',
          type: pushContent?.data?.type || 'push',
          rideId: pushContent?.data?.rideId || null
        });
        refreshRemoteNotifications().catch(() => {});
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
      case 'INTENT_REQUEST':
        navigation.navigate('Intent');
        break;
      case 'RIDE_ACCEPTED':
        if (data.conversationId) {
          navigation.navigate('ChatScreen', {
            conversationId: data.conversationId,
            rideName: 'Intent Match'
          });
        } else {
          navigation.navigate('Intent');
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
        notifications,
        unreadCount,
        addInAppNotification,
        markNotificationAsRead,
        clearInAppNotifications,
        requestPermission,
        clearNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
