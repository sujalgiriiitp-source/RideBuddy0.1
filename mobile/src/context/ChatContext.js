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
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const reconnectTimer = useRef(null);
  const hasTriedRootFallback = useRef(false);

  const buildSocket = (url) =>
    io(url, {
      transports: ['websocket'],
      auth: token ? { token } : undefined,
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

  // Initialize socket connection
  useEffect(() => {
    if (!user) return;

    const namespacedSocketUrl = `${API_URL}/chat`;
    console.log('[ChatContext] Connecting socket', { socketUrl: namespacedSocketUrl, platform: Platform.OS });

    let chatSocket = buildSocket(namespacedSocketUrl);

    chatSocket.on('connect', () => {
      console.log('Chat socket connected');
      setIsConnected(true);
    });

    chatSocket.on('disconnect', () => {
      console.log('Chat socket disconnected');
      setIsConnected(false);
    });

    chatSocket.on('connect_error', (error) => {
      console.log('Chat socket connection error:', error?.message || error);
      console.log(error);

      const isInvalidNamespace = String(error?.message || '').toLowerCase().includes('invalid namespace');
      if (isInvalidNamespace && !hasTriedRootFallback.current) {
        hasTriedRootFallback.current = true;
        console.log('[ChatContext] /chat namespace unavailable, retrying root namespace');
        chatSocket.disconnect();

        const fallbackSocket = buildSocket(API_URL);

        fallbackSocket.on('connect', () => {
          console.log('Chat socket connected (root fallback namespace)');
          setIsConnected(true);
        });

        fallbackSocket.on('disconnect', () => {
          setIsConnected(false);
        });

        fallbackSocket.on('connect_error', (fallbackError) => {
          console.log('Chat socket root fallback error:', fallbackError?.message || fallbackError);
        });

        fallbackSocket.on('chat:message:new', (data) => {
          handleNewMessage(data.message);
        });

        fallbackSocket.on('chat:message:read', (data) => {
          handleMessageRead(data);
        });

        chatSocket = fallbackSocket;
        setSocket(fallbackSocket);
      }
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
      hasTriedRootFallback.current = false;
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
    };
  }, [user, token]);

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
