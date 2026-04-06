const express = require('express');
const auth = require('../middleware/auth');
const chatController = require('../controllers/chatController');

const router = express.Router();

router.use(auth);

// POST /api/conversations
router.post('/', chatController.startConversation);

// GET /api/conversations
router.get('/', chatController.getUserConversations);

// GET /api/conversations/:rideId (compatibility endpoint)
router.get('/:rideId', chatController.getOrCreateConversation);

module.exports = router;
