const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Ride = require('../models/Ride');
const { StatusCodes } = require('http-status-codes');

const asObjectIdString = (value) => String(value || '');

const buildOtherParticipant = (participants, userId) => {
  return participants.find((participant) => asObjectIdString(participant?._id || participant) !== asObjectIdString(userId)) || null;
};

/**
 * Start or get conversation between logged in user and driver for a ride
 */
const startConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { rideId, driverId, receiverId } = req.body;
    const targetUserId = receiverId || driverId;

    if (!rideId || !targetUserId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'rideId and receiverId are required'
      });
    }

    const ride = await Ride.findById(rideId).populate('createdBy', 'name email phone');
    if (!ride) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (asObjectIdString(userId) === asObjectIdString(targetUserId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'You cannot start chat with yourself'
      });
    }

    if (asObjectIdString(ride.createdBy?._id || ride.createdBy) !== asObjectIdString(targetUserId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Provided driver does not match this ride'
      });
    }

    let conversation = await Conversation.findOne({
      rideId,
      participants: { $all: [userId, targetUserId] },
      $expr: { $eq: [{ $size: '$participants' }, 2] }
    })
      .populate('participants', 'name email')
      .populate('rideId', 'source destination dateTime price createdBy');

    if (!conversation) {
      conversation = await Conversation.create({
        rideId,
        participants: [userId, targetUserId],
        lastMessage: {
          text: '',
          senderId: userId,
          timestamp: new Date(),
          messageType: 'text'
        }
      });

      await conversation.populate('participants', 'name email');
      await conversation.populate('rideId', 'source destination dateTime price createdBy');
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Start conversation error:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to start conversation'
    });
  }
};

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

    const driverId = ride.createdBy;

    if (asObjectIdString(driverId) === asObjectIdString(userId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Driver cannot open a self conversation'
      });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      rideId,
      participants: { $all: [userId, driverId] },
      $expr: { $eq: [{ $size: '$participants' }, 2] }
    })
      .populate('participants', 'name email');

    if (!conversation) {
      // Create new direct conversation between passenger and driver
      const participants = [userId, driverId];
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
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    // Get unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          senderId: { $ne: userId },
          'readBy.userId': { $ne: userId }
        });

        const otherParticipant = buildOtherParticipant(conv.participants || [], userId);

        return {
          ...conv,
          otherParticipant,
          unreadCount
        };
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

    const messageIdsToMarkRead = messages
      .filter(
        (message) =>
          asObjectIdString(message.senderId?._id || message.senderId) !== asObjectIdString(userId) &&
          !message.readBy.some((entry) => asObjectIdString(entry?.userId?._id || entry?.userId) === asObjectIdString(userId))
      )
      .map((message) => message._id);

    if (messageIdsToMarkRead.length > 0) {
      await Message.updateMany(
        {
          _id: { $in: messageIdsToMarkRead },
          'readBy.userId': { $ne: userId }
        },
        {
          $push: {
            readBy: { userId, readAt: new Date() }
          }
        }
      );
    }

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
    const { conversationId, messageType = 'text', content, text, metadata } = req.body;
    const senderId = req.user._id;
    const messageContent = String(content || text || '').trim();

    if (!conversationId || !messageContent) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'conversationId and text are required'
      });
    }

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
      content: messageContent,
      metadata,
      readBy: [{ userId: senderId, readAt: new Date() }]
    });

    await message.populate('senderId', 'name email');

    // Update conversation's last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: {
        text: messageType === 'text' ? messageContent : `Sent a ${messageType}`,
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
  startConversation,
  getOrCreateConversation,
  getUserConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead
};
