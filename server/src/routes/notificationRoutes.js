const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  registerTokenSchema,
  unregisterTokenSchema,
  notificationIdParamsSchema
} = require('../validations/notificationValidation');
const {
  registerToken,
  unregisterToken,
  getTokens,
  getUnreadNotifications,
  markNotificationAsRead
} = require('../controllers/notificationController');

// Register push notification token
router.post('/register-token', auth, validate(registerTokenSchema), registerToken);

// Unregister push notification token
router.delete('/unregister-token', auth, validate(unregisterTokenSchema), unregisterToken);

// Get user's registered tokens
router.get('/tokens', auth, getTokens);

// Get unread notifications
router.get('/', auth, getUnreadNotifications);

// Mark notification as read
router.put('/:id/read', auth, validate(notificationIdParamsSchema, 'params'), markNotificationAsRead);

module.exports = router;
