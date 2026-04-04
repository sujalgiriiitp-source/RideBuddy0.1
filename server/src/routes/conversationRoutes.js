const express = require('express');
const auth = require('../middleware/auth');
const chatController = require('../controllers/chatController');

const router = express.Router();

// GET /api/conversations
// - With Bearer token: returns real user conversations
// - Without token: returns safe empty payload (prevents Route not found in browser/manual checks)
router.get('/', (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return auth(req, res, () => chatController.getUserConversations(req, res, next));
  }

  return res.status(200).json({
    success: true,
    message: 'Conversations endpoint available. Provide Bearer token for user conversations.',
    conversations: []
  });
});

// GET /api/conversations/:rideId (auth required)
router.get('/:rideId', auth, chatController.getOrCreateConversation);

module.exports = router;
