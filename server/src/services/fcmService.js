const admin = require('firebase-admin');
const logger = require('../config/logger');

const getServiceAccount = () => {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) {
    return null;
  }

  return JSON.parse(json);
};

const ensureFirebaseInitialized = () => {
  if (admin.apps.length > 0) {
    return true;
  }

  const serviceAccount = getServiceAccount();
  if (!serviceAccount) {
    return false;
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  return true;
};

const sendMulticastNotification = async ({ tokens, title, body, data = {} }) => {
  const uniqueTokens = [...new Set((tokens || []).filter(Boolean).map((token) => String(token).trim()))];
  if (uniqueTokens.length === 0) {
    return { successCount: 0, failureCount: 0 };
  }

  if (!ensureFirebaseInitialized()) {
    logger.warn('FCM skipped: FIREBASE_SERVICE_ACCOUNT_JSON is not configured');
    return { successCount: 0, failureCount: uniqueTokens.length };
  }

  const messaging = admin.messaging();
  return messaging.sendEachForMulticast({
    tokens: uniqueTokens,
    notification: {
      title,
      body
    },
    data: Object.fromEntries(
      Object.entries(data || {}).map(([key, value]) => [String(key), String(value)])
    )
  });
};

module.exports = {
  sendMulticastNotification
};
