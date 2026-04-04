const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET /api/chat/conversations - Get all user conversations
router.get('/conversations', chatController.getUserConversations);

// GET /api/chat/conversations/:rideId - Get or create conversation for ride
router.get('/conversations/:rideId', chatController.getOrCreateConversation);

// GET /api/chat/messages/:conversationId - Get messages (paginated)
router.get('/messages/:conversationId', chatController.getMessages);

// POST /api/chat/messages - Send message (HTTP alternative to socket)
router.post('/messages', chatController.sendMessage);

// PATCH /api/chat/messages/read - Mark messages as read
router.patch('/messages/read', chatController.markMessagesAsRead);

module.exports = router;
