const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Ride = require('../models/Ride');
const { StatusCodes } = require('http-status-codes');

/**
 * Get or create conversation for a ride
 */
const getOrCreateConversation = async (req, res) => {
  try {
    const { rideId } = req.params;
    const userId = req.user._id;

    // Check if ride exists
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Check if user is participant (creator or passenger)
    const isParticipant = 
      ride.createdBy.toString() === userId.toString() ||
      ride.passengers.some(p => p.toString() === userId.toString());

    if (!isParticipant) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'You are not a participant in this ride'
      });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({ rideId })
      .populate('participants', 'name email');

    if (!conversation) {
      // Create new conversation with all participants
      const participants = [ride.createdBy, ...ride.passengers];
      conversation = await Conversation.create({
        rideId,
        participants
      });
      await conversation.populate('participants', 'name email');
    }

    res.status(StatusCodes.OK).json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to get conversation'
    });
  }
};

/**
 * Get all conversations for current user
 */
const getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 20, page = 1 } = req.query;

    const conversations = await Conversation.find({
      participants: userId
    })
      .populate('participants', 'name email')
      .populate('rideId', 'source destination dateTime')
      .sort({ 'lastMessage.timestamp': -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    // Get unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          'readBy.userId': { $ne: userId }
        });
        return { ...conv, unreadCount };
      })
    );

    res.status(StatusCodes.OK).json({
      success: true,
      conversations: conversationsWithUnread
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to get conversations'
    });
  }
};

/**
 * Get messages for a conversation
 */
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const { limit = 50, before } = req.query;

    // Verify user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Not authorized to view this conversation'
      });
    }

    // Build query
    const query = { conversationId, deleted: false };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    // Get messages
    const messages = await Message.find(query)
      .populate('senderId', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.status(StatusCodes.OK).json({
      success: true,
      messages: messages.reverse() // Return in chronological order
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to get messages'
    });
  }
};

/**
 * Send message (HTTP endpoint - alternative to socket)
 */
const sendMessage = async (req, res) => {
  try {
    const { conversationId, messageType, content, metadata } = req.body;
    const senderId = req.user._id;

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === senderId.toString()
    );

    if (!isParticipant) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Not authorized to send messages in this conversation'
      });
    }

    // Create message
    const message = await Message.create({
      conversationId,
      senderId,
      messageType,
      content,
      metadata,
      readBy: [{ userId: senderId, readAt: new Date() }]
    });

    await message.populate('senderId', 'name email');

    // Update conversation's last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: {
        text: messageType === 'text' ? content : `Sent a ${messageType}`,
        senderId,
        timestamp: message.createdAt,
        messageType
      },
      updatedAt: new Date()
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

/**
 * Mark messages as read
 */
const markMessagesAsRead = async (req, res) => {
  try {
    const { messageIds } = req.body;
    const userId = req.user._id;

    await Message.updateMany(
      {
        _id: { $in: messageIds },
        'readBy.userId': { $ne: userId }
      },
      {
        $push: {
          readBy: { userId, readAt: new Date() }
        }
      }
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to mark messages as read'
    });
  }
};

module.exports = {
  getOrCreateConversation,
  getUserConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead
};
