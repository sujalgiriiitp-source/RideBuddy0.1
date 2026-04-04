import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_URL } from '../config';

const ChatContext = createContext({
  socket: null,
  conversations: [],
  unreadCount: 0,
  sendMessage: async () => {},
  markAsRead: async () => {},
  isConnected: false
});

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const reconnectTimer = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (!user || Platform.OS === 'web') return;

    const chatSocket = io(`${API_URL}/chat`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    chatSocket.on('connect', () => {
      console.log('Chat socket connected');
      setIsConnected(true);
    });

    chatSocket.on('disconnect', () => {
      console.log('Chat socket disconnected');
      setIsConnected(false);
    });

    chatSocket.on('connect_error', (error) => {
      console.error('Chat socket connection error:', error);
    });

    // Listen for new messages
    chatSocket.on('chat:message:new', (data) => {
      handleNewMessage(data.message);
    });

    // Listen for read receipts
    chatSocket.on('chat:message:read', (data) => {
      handleMessageRead(data);
    });

    setSocket(chatSocket);

    return () => {
      chatSocket.disconnect();
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
    };
  }, [user]);

  // Handle new message
  const handleNewMessage = (message) => {
    // Update conversations list
    setConversations(prev => {
      const convIndex = prev.findIndex(c => c._id === message.conversationId);
      if (convIndex >= 0) {
        const updated = [...prev];
        updated[convIndex].lastMessage = {
          text: message.content,
          senderId: message.sender._id,
          timestamp: message.createdAt,
          messageType: message.messageType
        };
        // Move to top
        const [conversation] = updated.splice(convIndex, 1);
        return [conversation, ...updated];
      }
      return prev;
    });

    // Increment unread count if not from current user
    if (message.sender._id !== user?._id) {
      setUnreadCount(prev => prev + 1);
    }
  };

  // Handle message read
  const handleMessageRead = (data) => {
    // Update local message state if needed
    console.log('Messages marked as read:', data);
  };

  // Join conversation
  const joinConversation = (conversationId) => {
    if (socket && isConnected) {
      socket.emit('chat:join', {
        conversationId,
        userId: user._id
      });
    }
  };

  // Leave conversation
  const leaveConversation = (conversationId) => {
    if (socket && isConnected) {
      socket.emit('chat:leave', { conversationId });
    }
  };

  // Send message via socket
  const sendMessage = async (conversationId, messageType, content, metadata = {}) => {
    if (!socket || !isConnected) {
      throw new Error('Chat not connected');
    }

    return new Promise((resolve, reject) => {
      socket.emit('chat:message:send', {
        conversationId,
        senderId: user._id,
        messageType,
        content,
        metadata
      });

      // Optimistic update - assume success
      resolve();
    });
  };

  // Mark messages as read
  const markAsRead = async (messageIds) => {
    if (!socket || !isConnected) return;

    socket.emit('chat:message:read', {
      messageIds,
      userId: user._id
    });

    // Decrease unread count
    setUnreadCount(prev => Math.max(0, prev - messageIds.length));
  };

  // Send typing indicator
  const sendTyping = (conversationId, isTyping) => {
    if (socket && isConnected) {
      socket.emit('chat:typing', {
        conversationId,
        userId: user._id,
        isTyping
      });
    }
  };

  return (
    <ChatContext.Provider
      value={{
        socket,
        isConnected,
        conversations,
        unreadCount,
        joinConversation,
        leaveConversation,
        sendMessage,
        markAsRead,
        sendTyping,
        setConversations,
        setUnreadCount
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
