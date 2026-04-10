import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '../api';

function isExpoGo() {
  return Constants.appOwnership === 'expo';
}

const canUseNotifications = () =>
  Platform.OS !== 'web' &&
  !isExpoGo() &&
  Boolean(Notifications) &&
  Boolean(Device?.isDevice);

// Configure notification behavior
if (canUseNotifications()) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      priority: Notifications.AndroidNotificationPriority.HIGH
    })
  });
}

const NOTIFICATION_TOKEN_KEY = '@ridebuddy:notification_token';
const DEVICE_ID_KEY = '@ridebuddy:device_id';

/**
 * Notification Service for Mobile
 * Handles push notification registration and management
 */
class NotificationServiceMobile {
  static notificationListener = null;
  static responseListener = null;

  static isAvailable() {
    return canUseNotifications();
  }

  static getUnavailableReason() {
    if (Platform.OS === 'web') {
      return 'Notifications are disabled on web.';
    }

    if (isExpoGo()) {
      return 'Notifications disabled in Expo Go';
    }

    if (!Notifications || !Device) {
      return 'Notification modules are unavailable in this runtime.';
    }

    return null;
  }

  /**
   * Request notification permissions
   */
  static async requestPermissions() {
    try {
      if (!this.isAvailable()) {
        console.log(this.getUnavailableReason());
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Failed to get push notification permissions');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Get or generate device ID
   */
  static async getDeviceId() {
    try {
      let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
      
      if (!deviceId) {
        // Generate unique device ID
        deviceId = `${Platform.OS}-${Device.modelName}-${Date.now()}`;
        await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
      }

      return deviceId;
    } catch (error) {
      console.error('Error getting device ID:', error);
      return `${Platform.OS}-${Date.now()}`;
    }
  }

  /**
   * Register device for push notifications
   */
  static async registerForPushNotifications() {
    try {
      if (!this.isAvailable()) {
        console.log(this.getUnavailableReason());
        return null;
      }

      // Only works on physical devices
      if (!Device?.isDevice) {
        console.warn('Push notifications only work on physical devices');
        return null;
      }

      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      // Expo push token (for Expo delivery)
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: '4250b61c-79b4-44c6-8aee-0027314c2e2d' // From app.json extra.eas.projectId
      });
      const expoPushToken = tokenData.data;
      const devicePushToken = await Notifications.getDevicePushTokenAsync().catch(() => null);
      const fcmToken =
        Platform.OS === 'android' ? String(devicePushToken?.data || '').trim() : '';

      // Get device ID
      const deviceId = await this.getDeviceId();

      // Register with backend
      await apiRequest('/notifications/register-token', {
        method: 'POST',
        token: await AsyncStorage.getItem('token'),
        body: {
          expoPushToken,
          fcmToken,
          deviceId,
          platform: Platform.OS
        }
      });

      // Save token locally
      await AsyncStorage.setItem(NOTIFICATION_TOKEN_KEY, expoPushToken);

      console.log('Push notification token registered:', expoPushToken);
      return expoPushToken;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  /**
   * Unregister device from push notifications
   */
  static async unregisterFromPushNotifications() {
    try {
      if (!this.isAvailable()) {
        return null;
      }

      const deviceId = await this.getDeviceId();

      await apiRequest('/notifications/unregister-token', {
        method: 'DELETE',
        token: await AsyncStorage.getItem('token'),
        body: { deviceId }
      });

      await AsyncStorage.removeItem(NOTIFICATION_TOKEN_KEY);
      console.log('Push notification token unregistered');
    } catch (error) {
      console.error('Error unregistering from push notifications:', error);
    }
  }

  /**
   * Setup notification listeners
   */
  static setupNotificationListeners(onNotification, onNotificationResponse) {
    if (!this.isAvailable()) {
      return;
    }

    // Listener for foreground notifications
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received (foreground):', notification);
      if (onNotification) {
        onNotification(notification);
      }
    });

    // Listener for notification taps
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      if (onNotificationResponse) {
        onNotificationResponse(response);
      }
    });
  }

  /**
   * Remove notification listeners
   */
  static removeNotificationListeners() {
    if (!Notifications) {
      return;
    }

    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
      this.notificationListener = null;
    }

    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
      this.responseListener = null;
    }
  }

  /**
   * Get notification badge count
   */
  static async getBadgeCount() {
    try {
      if (!this.isAvailable()) {
        return 0;
      }

      const count = await Notifications.getBadgeCountAsync();
      return count;
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  /**
   * Set notification badge count
   */
  static async setBadgeCount(count) {
    try {
      if (!this.isAvailable()) {
        return null;
      }

      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  /**
   * Clear all notifications
   */
  static async clearAllNotifications() {
    try {
      if (!this.isAvailable()) {
        return null;
      }

      await Notifications.dismissAllNotificationsAsync();
      await this.setBadgeCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  /**
   * Schedule local notification (for testing)
   */
  static async scheduleLocalNotification(title, body, data = {}, delay = 0) {
    try {
      if (!this.isAvailable()) {
        return null;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          vibrate: [0, 250, 250, 250]
        },
        trigger: delay > 0 ? { seconds: delay } : null
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }
}

export const isAvailable = () => NotificationServiceMobile.isAvailable();
export default NotificationServiceMobile;
export { NotificationServiceMobile };
