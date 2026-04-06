const express = require('express');
const auth = require('../middleware/auth');
const chatController = require('../controllers/chatController');

const router = express.Router();

router.use(auth);

// POST /api/messages
router.post('/', chatController.sendMessage);

// GET /api/messages/:conversationId
router.get('/:conversationId', chatController.getMessages);

module.exports = router;
