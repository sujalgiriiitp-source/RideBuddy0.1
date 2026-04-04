class NotificationServiceWeb {
  static notificationListener = null;
  static responseListener = null;

  static async requestPermissions() {
    console.log('[NotificationService][web] permissions not required');
    return false;
  }

  static async getDeviceId() {
    return 'web-device';
  }

  static async registerForPushNotifications() {
    console.log('[NotificationService][web] push registration skipped');
    return null;
  }

  static async unregisterFromPushNotifications() {
    return null;
  }

  static setupNotificationListeners() {
    return null;
  }

  static removeNotificationListeners() {
    return null;
  }

  static async getBadgeCount() {
    return 0;
  }

  static async setBadgeCount() {
    return null;
  }

  static async clearAllNotifications() {
    return null;
  }

  static async scheduleLocalNotification() {
    return null;
  }
}

export default NotificationServiceWeb;
