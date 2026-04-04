const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerTokenSchema, unregisterTokenSchema } = require('../validations/notificationValidation');
const {
  registerToken,
  unregisterToken,
  getTokens,
  sendTestNotification
} = require('../controllers/notificationController');

// Register push notification token
router.post('/register-token', auth, validate(registerTokenSchema), registerToken);

// Unregister push notification token
router.delete('/unregister-token', auth, validate(unregisterTokenSchema), unregisterToken);

// Get user's registered tokens
router.get('/tokens', auth, getTokens);

// Test notification (development only)
router.post('/test', auth, sendTestNotification);

module.exports = router;
