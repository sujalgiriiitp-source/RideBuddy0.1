const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

/**
 * Chat Socket Handler
 * Manages real-time chat functionality
 */
const setupChatSocket = (io) => {
  const chatNamespace = io.of('/chat');

  chatNamespace.on('connection', (socket) => {
    console.log(`Chat client connected: ${socket.id}`);

    // Join conversation room
    socket.on('chat:join', async ({ conversationId, userId }) => {
      try {
        // Verify conversation exists and user is participant
        const conversation = await Conversation.findById(conversationId);
        
        if (!conversation) {
          socket.emit('chat:error', { message: 'Conversation not found' });
          return;
        }

        const isParticipant = conversation.participants.some(
          p => p.toString() === userId
        );

        if (!isParticipant) {
          socket.emit('chat:error', { message: 'Not authorized to join this conversation' });
          return;
        }

        // Join room
        socket.join(`conversation:${conversationId}`);
        socket.userId = userId;
        socket.conversationId = conversationId;

        socket.emit('chat:joined', { conversationId });
        console.log(`User ${userId} joined conversation ${conversationId}`);
      } catch (error) {
        console.error('Chat join error:', error);
        socket.emit('chat:error', { message: 'Failed to join conversation' });
      }
    });

    // Send message
    socket.on('chat:message:send', async (messageData) => {
      try {
        const { conversationId, senderId, messageType, content, metadata } = messageData;

        // Create message in database
        const message = await Message.create({
          conversationId,
          senderId,
          messageType,
          content,
          metadata,
          readBy: [{ userId: senderId, readAt: new Date() }]
        });

        // Populate sender info
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

        // Broadcast to conversation room
        chatNamespace.to(`conversation:${conversationId}`).emit('chat:message:new', {
          message: {
            _id: message._id,
            conversationId: message.conversationId,
            sender: message.senderId,
            messageType: message.messageType,
            content: message.content,
            metadata: message.metadata,
            readBy: message.readBy,
            createdAt: message.createdAt
          }
        });

        console.log(`Message sent in conversation ${conversationId} by user ${senderId}`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('chat:error', { message: 'Failed to send message' });
      }
    });

    // Mark messages as read
    socket.on('chat:message:read', async ({ messageIds, userId }) => {
      try {
        // Update messages
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

        // Broadcast read receipt to conversation
        if (socket.conversationId) {
          chatNamespace.to(`conversation:${socket.conversationId}`).emit('chat:message:read', {
            messageIds,
            userId,
            readAt: new Date()
          });
        }

        console.log(`User ${userId} marked ${messageIds.length} messages as read`);
      } catch (error) {
        console.error('Mark as read error:', error);
        socket.emit('chat:error', { message: 'Failed to mark messages as read' });
      }
    });

    // Typing indicator
    socket.on('chat:typing', ({ conversationId, userId, isTyping }) => {
      socket.to(`conversation:${conversationId}`).emit('chat:typing', {
        userId,
        isTyping
      });
    });

    // Leave conversation
    socket.on('chat:leave', ({ conversationId }) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User left conversation ${conversationId}`);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`Chat client disconnected: ${socket.id}`);
    });
  });

  return chatNamespace;
};

module.exports = setupChatSocket;
